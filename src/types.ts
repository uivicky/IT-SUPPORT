export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ITCategory =
  | 'Windows 10 & Windows 11'
  | 'Networking & TCP/IP'
  | 'DNS & DHCP'
  | 'Active Directory'
  | 'Group Policy'
  | 'Microsoft 365'
  | 'Outlook & Exchange'
  | 'Laptop & Desktop Hardware'
  | 'Printer & Scanner'
  | 'Windows Server'
  | 'Linux'
  | 'Azure & Cloud'
  | 'VPN & Remote Access'
  | 'Remote Desktop'
  | 'Cybersecurity'
  | 'Antivirus & Firewall'
  | 'WiFi & LAN'
  | 'Software & Applications'
  | 'Email Troubleshooting'
  | 'Backup & Recovery'
  | 'IT Helpdesk & Ticketing'
  | 'Virtualization'
  | 'Storage & Disk Management'
  | 'File Sharing & Permissions'
  | 'User Account & Login Issues';

export interface IssueCommand {
  shell: 'CMD' | 'PowerShell' | 'Bash' | 'Config / CLI';
  command: string;
  note?: string;
}

export interface ITIssue {
  id: string;
  slug: string;
  title: string;
  category: ITCategory;
  errorCode?: string;
  shortDescription: string;
  symptoms: string[];
  possibleCauses: string[];
  solutionSteps: string[];
  commands: IssueCommand[];
  safetyWarning?: string;
  expectedResult: string;
  preventionTips: string[];
  difficulty: DifficultyLevel;
  estimatedTime: string;
  keywords: string[];
}

export interface CommandLibraryItem {
  id: string;
  command: string;
  platform: 'Windows CMD' | 'PowerShell' | 'Linux' | 'Active Directory' | 'Networking';
  purpose: string;
  example: string;
  expectedOutput: string;
  explanation: string;
  permissions: 'Standard User' | 'Local Administrator' | 'Domain Admin / Elevated' | 'Root / sudo';
  safetyWarning?: string;
}

export type InterviewTrack =
  | 'L1 Support'
  | 'L2 Support'
  | 'Desktop Support'
  | 'Networking'
  | 'Active Directory'
  | 'Windows Server'
  | 'Microsoft 365'
  | 'Linux'
  | 'Azure'
  | 'System Administrator'
  | 'Scenario-Based Troubleshooting';

export interface InterviewQuestion {
  id: string;
  track: InterviewTrack;
  question: string;
  shortAnswer: string;
  practicalExample: string;
  difficulty: DifficultyLevel;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  summary: string;
  skills: string[];
  handsOnLab: string;
  keyCommands: string[];
  relatedCategory: ITCategory;
}

export interface RoadmapLevel {
  level: DifficultyLevel;
  title: string;
  subtitle: string;
  estimatedDuration: string;
  targetRoles: string[];
  topics: RoadmapTopic[];
}

export interface AIDiagnosticCommand {
  command: string;
  shell: string;
  description: string;
  safetyWarning?: string;
}

export interface AIDiagnosticResponse {
  problemSummary: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  possibleCauses: string[];
  steps: string[];
  commands: AIDiagnosticCommand[];
  expectedResult: string;
  furtherTroubleshooting: string[];
  followUpQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  diagnostic?: AIDiagnosticResponse;
  relatedSlugs?: string[];
  timestamp: string;
}
