/**
 * IT SUPPORT - Technical Runbook SEO Enrichment Engine
 * Generates search-intent-optimized metadata, FAQs, verification procedures,
 * and official vendor references for all 325+ IT troubleshooting runbooks.
 */

import { ITIssue } from '../types';

export interface EnrichedSEOData {
  searchIntentTitle: string;
  metaDescription: string;
  primaryH1: string;
  faqs: { question: string; answer: string }[];
  verificationProcedure: string[];
  advancedDiagnostics: string[];
  officialReferences: { name: string; url: string; note: string }[];
}

export function formatSearchIntentTitle(issue: ITIssue): string {
  // If title already starts with "How to" or similar, polish it
  const cleanTitle = issue.title.trim();
  const errorCodePart = issue.errorCode ? ` (${issue.errorCode})` : '';

  if (/^(how to|fix|troubleshoot)/i.test(cleanTitle)) {
    return `${cleanTitle}${errorCodePart} — Step-by-Step Fix`;
  }
  return `How to Fix ${cleanTitle}${errorCodePart} — IT Support Guide`;
}

export function buildOfficialReferences(category: string): { name: string; url: string; note: string }[] {
  const cat = category.toLowerCase();

  if (cat.includes('azure') || cat.includes('cloud')) {
    return [
      {
        name: 'Microsoft Learn: Azure Architecture & Troubleshooting',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/',
        note: 'Official Microsoft cloud architecture and diagnostic runbooks.',
      },
      {
        name: 'Azure Status & Service Health',
        url: 'https://azure.status.microsoft/status',
        note: 'Global Azure infrastructure status and active incident tracking.',
      },
    ];
  }

  if (cat.includes('active directory') || cat.includes('group policy')) {
    return [
      {
        name: 'Microsoft Learn: Active Directory Domain Services',
        url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services',
        note: 'Domain Controller health, replication, Kerberos, and GPO precedence specifications.',
      },
      {
        name: 'Microsoft Learn: Group Policy Administrative Reference',
        url: 'https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831791(v=ws.11)',
        note: 'Group Policy processing, WMI filters, and registry CSE documentation.',
      },
    ];
  }

  if (cat.includes('microsoft 365') || cat.includes('outlook') || cat.includes('email')) {
    return [
      {
        name: 'Microsoft 365 Admin Center Documentation',
        url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/',
        note: 'Exchange Online mail flow, tenant security, and account management.',
      },
      {
        name: 'Microsoft Community & Diagnostics Support',
        url: 'https://support.microsoft.com/',
        note: 'Client Outlook, Teams, and Entra ID authentication fixes.',
      },
    ];
  }

  if (cat.includes('network') || cat.includes('dns') || cat.includes('dhcp') || cat.includes('wifi') || cat.includes('vpn')) {
    return [
      {
        name: 'Cisco Networking Documentation & Best Practices',
        url: 'https://www.cisco.com/c/en/us/support/index.html',
        note: 'Enterprise switching, VLAN routing, MTU boundaries, and TCP/IP standards.',
      },
      {
        name: 'IANA Root Zone & RFC Standards',
        url: 'https://www.iana.org/domains/root',
        note: 'Authoritative DNS specifications and RFC standards.',
      },
    ];
  }

  if (cat.includes('linux')) {
    return [
      {
        name: 'Ubuntu & Debian System Administration Guides',
        url: 'https://help.ubuntu.com/',
        note: 'Official systemd daemon handling, storage, and networking configuration.',
      },
      {
        name: 'Red Hat Enterprise Linux Documentation',
        url: 'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux',
        note: 'Enterprise kernel diagnostics, SELinux, LVM, and firewall policies.',
      },
    ];
  }

  if (cat.includes('server') || cat.includes('storage') || cat.includes('backup') || cat.includes('virtualization')) {
    return [
      {
        name: 'Microsoft Learn: Windows Server Administration',
        url: 'https://learn.microsoft.com/en-us/windows-server/',
        note: 'Failover Clustering, VSS Writers, Storage Spaces, and Hyper-V guides.',
      },
      {
        name: 'VMware Documentation by Broadcom',
        url: 'https://docs.vmware.com/',
        note: 'vSphere ESXi virtualization and storage multipathing documentation.',
      },
    ];
  }

  // Windows / General Endpoint fallback
  return [
    {
      name: 'Microsoft Learn: Windows Client Management',
      url: 'https://learn.microsoft.com/en-us/windows/client-management/',
      note: 'Official Windows 10 & 11 deployment, servicing, and driver architecture.',
    },
    {
      name: 'Microsoft Support Knowledge Base',
      url: 'https://support.microsoft.com/windows',
      note: 'Verified Windows client troubleshooting and update recovery procedures.',
    },
  ];
}

export function generateRunbookFAQs(issue: ITIssue): { question: string; answer: string }[] {
  const codeSuffix = issue.errorCode ? ` (Error ${issue.errorCode})` : '';

  return [
    {
      question: `What is the fastest way to fix "${issue.title}"${codeSuffix}?`,
      answer: `Start by verifying: ${issue.solutionSteps[0] || 'rebooting the affected service'}. If the error persists, execute the recommended command: "${issue.commands[0]?.command || 'ipconfig /flushdns'}" in an elevated prompt and verify that ${issue.expectedResult.toLowerCase()}`,
    },
    {
      question: `What causes "${issue.title}" in enterprise environments?`,
      answer: `The most common root causes include: ${issue.possibleCauses.slice(0, 3).join('; ')}. Checking Event Viewer or system logs before altering settings prevents configuration drift.`,
    },
    {
      question: `How can IT teams prevent this ${issue.category} problem from recurring?`,
      answer: `Recommended best practices: ${issue.preventionTips.slice(0, 2).join(' and ')}. Maintain automated backups and adhere to standard change control protocols.`,
    },
  ];
}

export function generateVerificationProcedure(issue: ITIssue): string[] {
  return [
    `Confirm that ${issue.expectedResult.replace(/\.$/, '')}.`,
    `Review System and Application Event logs or syslog to ensure no secondary warning events fired.`,
    `Have the end user or monitoring prober repeat the previous failed action to validate complete remediation.`,
    `Document the verified root cause and applied commands in the helpdesk ticketing record before closing the incident.`,
  ];
}

export function generateAdvancedDiagnostics(issue: ITIssue): string[] {
  const baseCmd = issue.commands[0]?.command || 'netstat -ano';
  return [
    `Run elevated health audit: "${baseCmd}" to inspect real-time subsystem state.`,
    `Trace network and firewall sockets if communication drops across boundaries.`,
    `Review security filter permissions and credential validity across domain controllers or identity providers.`,
  ];
}

export function enrichRunbookSEO(issue: ITIssue): EnrichedSEOData {
  const searchIntentTitle = formatSearchIntentTitle(issue);
  const metaDescription = `${issue.shortDescription.slice(0, 120)} Complete step-by-step fix, CLI commands, root cause analysis, and prevention guide.`.slice(0, 155);
  const primaryH1 = searchIntentTitle;
  const faqs = generateRunbookFAQs(issue);
  const verificationProcedure = generateVerificationProcedure(issue);
  const advancedDiagnostics = generateAdvancedDiagnostics(issue);
  const officialReferences = buildOfficialReferences(issue.category);

  return {
    searchIntentTitle,
    metaDescription,
    primaryH1,
    faqs,
    verificationProcedure,
    advancedDiagnostics,
    officialReferences,
  };
}
