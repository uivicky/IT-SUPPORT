import { AIDiagnosticResponse, ITCategory, ITIssue } from '../types';

export type ThreeStagePresetId =
  | 'network'
  | 'windows'
  | 'hardware'
  | 'printer'
  | 'email'
  | 'security'
  | 'software'
  | 'server'
  | 'cloud'
  | 'ai';

export interface ThreeStagePreset {
  id: ThreeStagePresetId;
  label: string;
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
}

export const STAGE_PRESETS: Record<ThreeStagePresetId, ThreeStagePreset> = {
  network: {
    id: 'network',
    label: 'Packet Relay Torus',
    primaryColor: 0x27d3f0,
    secondaryColor: 0x5b8cff,
    accentColor: 0x8b6cff,
  },
  windows: {
    id: 'windows',
    label: 'OS Kernel Matrix',
    primaryColor: 0x6b8bff,
    secondaryColor: 0x27d3f0,
    accentColor: 0x8b6cff,
  },
  hardware: {
    id: 'hardware',
    label: 'Thermal Silicon Core',
    primaryColor: 0x38bdf8,
    secondaryColor: 0x94a3b8,
    accentColor: 0xf59e0b,
  },
  printer: {
    id: 'printer',
    label: 'Spooler Drum Assembly',
    primaryColor: 0x27d3f0,
    secondaryColor: 0xa78bfa,
    accentColor: 0x34d399,
  },
  email: {
    id: 'email',
    label: 'Mail Transport Hub',
    primaryColor: 0x8b6cff,
    secondaryColor: 0x27d3f0,
    accentColor: 0x60a5fa,
  },
  security: {
    id: 'security',
    label: 'Zero-Trust Shield Core',
    primaryColor: 0xa855f7,
    secondaryColor: 0x27d3f0,
    accentColor: 0xf43f5e,
  },
  software: {
    id: 'software',
    label: 'Modular Runtime Stack',
    primaryColor: 0x818cf8,
    secondaryColor: 0x2dd4bf,
    accentColor: 0x8b6cff,
  },
  server: {
    id: 'server',
    label: 'Enterprise Rack Cluster',
    primaryColor: 0x6366f1,
    secondaryColor: 0x27d3f0,
    accentColor: 0x10b981,
  },
  cloud: {
    id: 'cloud',
    label: 'Hybrid Cloud Mesh',
    primaryColor: 0x27d3f0,
    secondaryColor: 0x8b6cff,
    accentColor: 0x38bdf8,
  },
  ai: {
    id: 'ai',
    label: 'AI Diagnostic Synthesizer',
    primaryColor: 0x8b6cff,
    secondaryColor: 0x27d3f0,
    accentColor: 0xe879f9,
  },
};

export function getStagePresetForCategory(
  category: ITCategory | 'AI Assistant' | string
): ThreeStagePreset {
  const norm = (category || '').toLowerCase();

  if (norm.includes('ai')) {
    return STAGE_PRESETS.ai;
  }
  if (
    norm.includes('network') ||
    norm.includes('dns') ||
    norm.includes('dhcp') ||
    norm.includes('wifi') ||
    norm.includes('vpn')
  ) {
    return STAGE_PRESETS.network;
  }
  if (norm.includes('printer') || norm.includes('scanner')) {
    return STAGE_PRESETS.printer;
  }
  if (
    norm.includes('hardware') ||
    norm.includes('storage') ||
    norm.includes('disk')
  ) {
    return STAGE_PRESETS.hardware;
  }
  if (
    norm.includes('outlook') ||
    norm.includes('exchange') ||
    norm.includes('email')
  ) {
    return STAGE_PRESETS.email;
  }
  if (
    norm.includes('cybersecurity') ||
    norm.includes('security') ||
    norm.includes('antivirus') ||
    norm.includes('firewall') ||
    norm.includes('login') ||
    norm.includes('account')
  ) {
    return STAGE_PRESETS.security;
  }
  if (
    norm.includes('azure') ||
    norm.includes('cloud') ||
    norm.includes('365')
  ) {
    return STAGE_PRESETS.cloud;
  }
  if (
    norm.includes('server') ||
    norm.includes('active directory') ||
    norm.includes('group policy') ||
    norm.includes('linux') ||
    norm.includes('virtualization') ||
    norm.includes('backup')
  ) {
    return STAGE_PRESETS.server;
  }
  if (
    norm.includes('software') ||
    norm.includes('helpdesk') ||
    norm.includes('file sharing') ||
    norm.includes('remote desktop')
  ) {
    return STAGE_PRESETS.software;
  }
  if (norm.includes('windows')) {
    return STAGE_PRESETS.windows;
  }

  return STAGE_PRESETS.network;
}

export interface CategorizedIssueGroup {
  category: ITCategory;
  issues: ITIssue[];
}

export function groupIssuesByCategory(issues: ITIssue[]): CategorizedIssueGroup[] {
  const map = new Map<ITCategory, ITIssue[]>();
  for (const issue of issues) {
    const existing = map.get(issue.category);
    if (existing) {
      existing.push(issue);
    } else {
      map.set(issue.category, [issue]);
    }
  }
  return Array.from(map.entries()).map(([category, grouped]) => ({
    category,
    issues: grouped,
  }));
}

export function formatDiagnosticAsPlainAnswer(
  diagnostic: AIDiagnosticResponse
): string {
  const lines: string[] = [];

  if (diagnostic.problemSummary) {
    lines.push(`Summary (${diagnostic.severity} Severity):`);
    lines.push(diagnostic.problemSummary.trim());
    lines.push('');
  }

  if (Array.isArray(diagnostic.steps) && diagnostic.steps.length > 0) {
    lines.push('Step-by-Step Solution:');
    diagnostic.steps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step.trim()}`);
    });
    lines.push('');
  }

  if (Array.isArray(diagnostic.commands) && diagnostic.commands.length > 0) {
    lines.push('Diagnostic Commands:');
    diagnostic.commands.forEach((cmd) => {
      const caution = cmd.safetyWarning ? ` [Caution: ${cmd.safetyWarning}]` : '';
      lines.push(`• [${cmd.shell}] ${cmd.command} — ${cmd.description}${caution}`);
    });
    lines.push('');
  }

  if (diagnostic.expectedResult) {
    lines.push(`Expected Result: ${diagnostic.expectedResult.trim()}`);
  }

  return lines.join('\n').trim();
}
