import { GoogleGenAI, Type } from '@google/genai';

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;

function checkRateLimit(clientKey: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = rateBuckets.get(clientKey);
  if (!existing || now > existing.resetAt) {
    rateBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

const SYSTEM_INSTRUCTION = `You are IT SUPPORT AI, acting as both a Senior Enterprise IT Support Engineer AND a friendly Personal IT Tutor.
Your goal is to either diagnose IT problems step-by-step OR teach IT concepts clearly from zero to beginners and engineers.

STRICT SAFETY & QUALITY RULES:
1. Keep language simple, warm, practical, and structured step-by-step. If the user asks in Hinglish or requests Hinglish, include easy Hinglish explanations alongside English terms.
2. When explaining a concept in Tutor Mode: use "problemSummary" for a crystal-clear plain-English definition + real-life analogy, "possibleCauses" for key building blocks / why this concept matters in IT jobs, "steps" for how the technology works step-by-step, "commands" for safe beginner commands to try, and "expectedResult" for the key takeaway to remember.
3. NEVER recommend destructive or unrecoverable commands (such as rm -rf /, del /f /s /q C:\\*, cipher /w on live OS, disabling SELinux/Defender permanently in production, or editing AD/Registry without backups).
4. Whenever a command restarts a service, modifies registry/network state, or requires Administrator/sudo rights, populate a clear "safetyWarning" on that command.
5. Provide 3 short clickable follow-up prompts in "followUpQuestions" to help the learner or engineer keep exploring.`;

const DIAGNOSTIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    problemSummary: {
      type: Type.STRING,
      description: 'Clear 1-2 sentence identification of the technical issue OR friendly beginner definition + analogy in Tutor mode.',
    },
    severity: {
      type: Type.STRING,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      description: 'Operational impact severity (use Low for general learning/tutoring questions).',
    },
    possibleCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 most likely root causes (or key building blocks in Tutor mode).',
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 to 7 concise, sequential step-by-step troubleshooting actions (or step-by-step concept walkthrough in Tutor mode).',
    },
    commands: {
      type: Type.ARRAY,
      description: 'Relevant safe diagnostic or learning CLI commands.',
      items: {
        type: Type.OBJECT,
        properties: {
          command: { type: Type.STRING },
          shell: {
            type: Type.STRING,
            description: 'e.g., CMD (Admin), PowerShell, Linux Bash, Cisco IOS, Azure CLI',
          },
          description: { type: Type.STRING },
          safetyWarning: {
            type: Type.STRING,
            description: 'Optional caution if elevated privileges or service interruption applies.',
          },
        },
        required: ['command', 'shell', 'description'],
      },
    },
    expectedResult: {
      type: Type.STRING,
      description: 'How to verify the fix succeeded (or key takeaway summary in Tutor mode).',
    },
    furtherTroubleshooting: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 escalation checks or common beginner mistakes to avoid.',
    },
    followUpQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 short clickable follow-up prompts or diagnostic questions.',
    },
  },
  required: [
    'problemSummary',
    'severity',
    'possibleCauses',
    'steps',
    'commands',
    'expectedResult',
    'furtherTroubleshooting',
    'followUpQuestions',
  ],
};

export function isGeminiConfigured(): boolean {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key !== 'your_gemini_api_key_here');
}

export async function handleTroubleshootRequest(params: {
  clientIp: string;
  body: {
    message?: string;
    mode?: 'troubleshoot' | 'tutor';
    learnerLevel?: 'beginner' | 'student' | 'advanced';
    hinglish?: boolean;
    history?: { role: string; content: string }[];
  };
}): Promise<{ status: number; headers?: Record<string, string>; payload: Record<string, unknown> }> {
  const rate = checkRateLimit(params.clientIp || 'anonymous');
  if (!rate.allowed) {
    return {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSec) },
      payload: {
        configured: isGeminiConfigured(),
        error: `Rate limit reached (max ${RATE_LIMIT_MAX_REQUESTS} requests/minute). Please wait ${rate.retryAfterSec}s before sending another query.`,
      },
    };
  }

  const rawMessage = (params.body?.message || '').trim();
  if (!rawMessage) {
    return {
      status: 400,
      payload: {
        configured: isGeminiConfigured(),
        error: 'Please enter an IT issue, symptom, or IT concept question.',
      },
    };
  }

  if (rawMessage.length > 2500) {
    return {
      status: 400,
      payload: {
        configured: isGeminiConfigured(),
        error: 'Problem description is too long (maximum 2,500 characters).',
      },
    };
  }

  if (!isGeminiConfigured()) {
    return {
      status: 503,
      payload: {
        configured: false,
        error:
          'IT SUPPORT AI is not configured yet because GEMINI_API_KEY is missing on the server. Add GEMINI_API_KEY in AI Studio Secrets or Vercel Environment Variables to enable live AI diagnostics. Meanwhile, review the matching Knowledge Base solutions below.',
      },
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        timeout: 12000,
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const levelHint =
      params.body?.learnerLevel === 'advanced'
        ? 'Tailor depth for an Advanced IT/SysAdmin Engineer with protocol & architecture precision'
        : params.body?.learnerLevel === 'student'
        ? 'Tailor depth for an IT Support Student preparing for L1/L2 Helpdesk roles and interviews'
        : 'Explain from absolute zero using everyday real-life analogies and zero jargon';

    const modeDirective =
      params.body?.mode === 'tutor'
        ? `[MODE 2: IT LEARNING TEACHER — ${levelHint}${
            params.body?.hinglish ? ', including friendly Hinglish alongside Simple English' : ' in Simple English'
          }. Include at least one interactive quick check question in followUpQuestions.]`
        : `[MODE 1: IT TROUBLESHOOTING ENGINEER${
            params.body?.hinglish ? ' — Include Simple English + Hinglish clarity' : ''
          }]`;

    const historyItems = Array.isArray(params.body?.history) ? params.body.history.slice(-6) : [];
    const contextTranscript =
      historyItems.length > 0
        ? `${modeDirective}\nPrevious Context:\n${historyItems
            .map((h) => `${h.role === 'user' ? 'User' : 'IT SUPPORT AI'}: ${String(h.content).slice(0, 600)}`)
            .join('\n')}\n\nCurrent Question:\n${rawMessage}`
        : `${modeDirective}\n${rawMessage}`;

    const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'] as const;
    const startedAt = Date.now();
    let lastError: unknown = null;
    let responseText = '';

    for (let attempt = 0; attempt < CANDIDATE_MODELS.length; attempt++) {
      const modelName = CANDIDATE_MODELS[attempt];
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contextTranscript,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: DIAGNOSTIC_SCHEMA,
          },
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (callErr: unknown) {
        lastError = callErr;
        const msg = callErr instanceof Error ? callErr.message : String(callErr);
        const isTransient = /503|unavailable|high demand|overloaded|502|504/i.test(msg);
        if (
          isTransient &&
          attempt < CANDIDATE_MODELS.length - 1 &&
          Date.now() - startedAt < 4000
        ) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          continue;
        }
        throw callErr;
      }
    }

    if (!responseText) {
      if (lastError) throw lastError;
      return {
        status: 502,
        payload: {
          configured: true,
          error: 'IT SUPPORT AI returned an empty response. Please try rephrasing the issue.',
        },
      };
    }

    const parsed = JSON.parse(responseText);
    return {
      status: 200,
      payload: {
        configured: true,
        diagnostic: parsed,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected Gemini API error.';
    const isAuthError = /api.?key|permission|unauthenticated|401|403/i.test(message);
    const isHighDemand = /503|unavailable|high demand|overloaded/i.test(message);
    return {
      status: isAuthError || isHighDemand ? 503 : 500,
      payload: {
        configured: !isAuthError,
        upstreamUnavailable: isHighDemand,
        error: isAuthError
          ? 'Server GEMINI_API_KEY is invalid or unauthorized. Verify GEMINI_API_KEY in your server environment settings.'
          : isHighDemand
          ? 'Live AI model is temporarily experiencing high demand (HTTP 503). Retry in a moment or inspect the matching verified runbooks below.'
          : 'IT SUPPORT AI encountered a temporary upstream error while generating diagnostics. Please try again or inspect the matching verified runbooks below.',
      },
    };
  }
}

// Vercel Serverless Function default export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const forwarded = req.headers?.['x-forwarded-for'];
  const clientIp =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
    req.socket?.remoteAddress ||
    'anonymous';

  const result = await handleTroubleshootRequest({
    clientIp,
    body: typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {},
  });

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  return res.status(result.status).json(result.payload);
}
