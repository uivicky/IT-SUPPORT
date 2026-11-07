import { handleTroubleshootRequest } from './ai/troubleshoot';
import { formatDiagnosticAsPlainAnswer } from '../src/utils/quickDeskHelpers';
import { AIDiagnosticResponse } from '../src/types';

export async function handleInlineAiRequest(params: {
  clientIp: string;
  body: {
    query?: string;
    message?: string;
    mode?: 'troubleshoot' | 'tutor';
    learnerLevel?: 'beginner' | 'student' | 'advanced';
    hinglish?: boolean;
  };
}): Promise<{ status: number; headers?: Record<string, string>; payload: Record<string, unknown> }> {
  const promptText = (params.body?.query || params.body?.message || '').trim();

  const result = await handleTroubleshootRequest({
    clientIp: params.clientIp,
    body: {
      message: promptText,
      mode: params.body?.mode || 'troubleshoot',
      learnerLevel: params.body?.learnerLevel || 'student',
      hinglish: params.body?.hinglish,
    },
  });

  if (result.status === 200 && result.payload.diagnostic) {
    const diagnostic = result.payload.diagnostic as AIDiagnosticResponse;
    return {
      status: 200,
      headers: result.headers,
      payload: {
        ...result.payload,
        answer: formatDiagnosticAsPlainAnswer(diagnostic),
      },
    };
  }

  return result;
}

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

  let parsedBody: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body || '{}');
    } catch {
      parsedBody = {};
    }
  } else if (req.body && typeof req.body === 'object') {
    parsedBody = req.body;
  }

  const result = await handleInlineAiRequest({
    clientIp,
    body: parsedBody,
  });

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  return res.status(result.status).json(result.payload);
}
