import { CompactIssueSeed, expandIssues } from './issueBuilder';

const SEEDS_PART_2: CompactIssueSeed[] = [
  // ================= 6. Microsoft 365 (13 issues) =================
  {
    id: 'M365-001',
    title: 'Microsoft Teams Stuck on Sign-In Loop (Error CAA20002 / AADSTS50058)',
    category: 'Microsoft 365',
    errorCode: 'AADSTS50058',
    desc: 'New Teams desktop client loops at sign-in or shows We could not sign you in due to stale Web Account Manager (WAM) broker tokens.',
    symptoms: ['Teams asks to sign in repeatedly without opening channels', 'Web Teams at teams.microsoft.com works normally'],
    causes: ['Corrupted MSTeams local AppData cache', 'Disconnected Work or School account token in Windows WAM'],
    steps: ['Quit Microsoft Teams completely from the system tray.', 'Clear the New Teams local package cache folder.', 'Check Settings > Accounts > Access work or school and re-authenticate if a warning banner is shown.', 'Relaunch Teams.'],
    cmds: [
      ['PowerShell', 'Stop-Process -Name "ms-teams" -Force -ErrorAction SilentlyContinue', 'Terminate New Teams process'],
      ['PowerShell', 'Remove-Item -Path "$env:LOCALAPPDATA\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache\\Microsoft\\MSTeams\\*" -Recurse -Force', 'Clear New Teams cache']
    ],
    expected: 'Teams acquires a fresh Entra ID token via WAM and opens workspaces cleanly.',
    prevent: ['Keep Microsoft Edge WebView2 Runtime updated across endpoints'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['teams sign in loop', 'aadsts50058', 'msteams cache', 'caa20002']
  },
  {
    id: 'M365-002',
    title: 'OneDrive Stuck on Processing Changes for Hours',
    category: 'Microsoft 365',
    desc: 'OneDrive sync client spins indefinitely on Processing X changes and stops uploading edited Office files.',
    symptoms: ['Blue sync arrows spin continuously on taskbar', 'New local files do not appear in OneDrive web'],
    causes: ['Single huge archive (.pst, .iso, node_modules) blocking queue', 'Path length >400 characters or invalid characters', 'Wedged sync engine'],
    steps: ['Click the OneDrive tray icon to check for specific file name/path errors.', 'Move any .pst archives or build folders out of synced directories.', 'Run the built-in OneDrive /reset switch to rebuild local sync state without deleting cloud data.'],
    cmds: [
      ['CMD', '"%LOCALAPPDATA%\\Microsoft\\OneDrive\\OneDrive.exe" /reset', 'Reset OneDrive sync engine'],
      ['CMD', '"%LOCALAPPDATA%\\Microsoft\\OneDrive\\OneDrive.exe"', 'Restart OneDrive if not auto-launched after 60s']
    ],
    expected: 'OneDrive re-indexes files and displays Up to date status.',
    prevent: ['Block .pst and temporary build extensions via SharePoint/OneDrive sync admin center'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['onedrive processing changes', 'onedrive not syncing', 'onedrive /reset']
  },
  {
    id: 'M365-003',
    title: 'Microsoft 365 Apps Unlicensed Product Banner Despite Assigned License',
    category: 'Microsoft 365',
    desc: 'Word and Excel show Unlicensed Product or Read-Only mode even though the user has an active M365 Business Premium or E3 license.',
    symptoms: ['Red Unlicensed Product bar in Word/Excel', 'User license shows Active in M365 Admin Center'],
    causes: ['Microsoft 365 Apps sub-service checkbox unchecked inside license', 'Device exceeded 5-device activation limit', 'Stale vNext / OLicenseHeartbeat token'],
    steps: ['Confirm Microsoft 365 Apps for enterprise/business app checkbox is enabled under user Licenses and apps.', 'Sign out of Office apps and clear cached Office identity credentials.', 'Re-open Word and sign in with corporate UPN.'],
    cmds: [
      ['PowerShell', 'Remove-Item -Path "$env:LOCALAPPDATA\\Microsoft\\IdentityCache\\*" -Recurse -Force -ErrorAction SilentlyContinue', 'Clear vNext Office identity cache'],
      ['CMD', 'cscript "C:\\Program Files\\Microsoft Office\\Office16\\ospp.vbs" /dstatus', 'Check legacy MAK/KMS conflict keys']
    ],
    expected: 'Subscription license activates immediately and full editing unlocks.',
    prevent: ['Remove leftover Office 2016/2019 KMS/MAK keys when migrating fleets to M365 Apps'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['unlicensed product', 'm365 activation', 'ospp.vbs', 'identitycache']
  },
  {
    id: 'M365-004',
    title: 'Entra Connect Sync Error: AttributeValueMustBeUnique (ProxyAddresses Conflict)',
    category: 'Microsoft 365',
    desc: 'On-premises AD user fails to sync to Microsoft 365 because another cloud object already holds the same SMTP proxyAddress.',
    symptoms: ['User missing in M365 Admin Center or password changes fail to sync', 'Entra Health alerts AttributeValueMustBeUnique'],
    causes: ['Cloud-only shared mailbox or soft-deleted user already owns jsmith@company.com', 'Duplicate proxyAddresses attribute in local AD'],
    steps: ['Search Exchange Online for any active or soft-deleted recipient holding the conflicting email address.', 'Remove or permanently purge the conflicting cloud-only duplicate (or match via SMTP soft-match if intended).', 'Run Start-ADSyncSyncCycle -PolicyType Delta on the Entra Connect server.'],
    cmds: [
      ['PowerShell', "Get-EXORecipient -Filter \"EmailAddresses -eq 'smtp:jsmith@company.com'\"", 'Find cloud object holding duplicate SMTP'],
      ['PowerShell', 'Start-ADSyncSyncCycle -PolicyType Delta', 'Trigger Entra Connect delta sync']
    ],
    expected: 'Sync error clears and AD user links cleanly to Entra ID.',
    prevent: ['Provision all mailboxes consistently from on-prem AD/Exchange Hybrid when Directory Sync is active'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['attributevaluemustbeunique', 'proxyaddresses', 'entra connect', 'start-adsyncsynccycle']
  },
  {
    id: 'M365-005',
    title: 'User Locked Out of MFA After Upgrading or Losing Mobile Phone',
    category: 'Microsoft 365',
    desc: 'Employee gets a new smartphone and cannot approve Microsoft Authenticator push prompts to sign into M365.',
    symptoms: ['Authenticator app on new phone has greyed-out account or receives no push notifications', 'User has no secondary FIDO2/SMS method'],
    causes: ['Authenticator push credentials are hardware-bound and do not transfer fully without re-registration'],
    steps: ['Verify the employee identity out-of-band per company helpdesk security policy (video call / manager verification).', 'In Microsoft Entra Admin Center > Users > Authentication methods, click Require re-register multifactor authentication.', 'Optionally issue a single-use Temporary Access Pass (TAP) so the user can securely register their new Authenticator and passkey.'],
    cmds: [
      ['PowerShell', '# In Microsoft Graph PowerShell:\nConnect-MgGraph -Scopes "UserAuthenticationMethod.ReadWrite.All"\nGet-MgUserAuthenticationMethod -UserId "jsmith@company.com"', 'Inspect registered MFA methods']
    ],
    warn: 'Always perform strict identity verification before resetting MFA—social engineering Helpdesk for MFA resets is a top ransomware vector.',
    expected: 'User scans fresh QR code at aka.ms/mfasetup and enrolls new phone.',
    prevent: ['Encourage users to register 2 MFA methods (e.g., Authenticator + FIDO2 security key or Windows Hello)'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['mfa reset', 'new phone authenticator', 'temporary access pass', 'require re-register mfa']
  },
  {
    id: 'M365-006',
    title: 'SharePoint Online Access Denied Despite Adding User to M365 Group',
    category: 'Microsoft 365',
    desc: 'User added to a SharePoint site or Microsoft 365 Group still gets Access Denied on a specific document library.',
    symptoms: ['You need permission to access this site/folder', 'Other team members in same group can open the site'],
    causes: ['Document library or subfolder has broken permission inheritance', 'Browser caching stale SharePoint access cookie', 'UPN re-created with same email causing PUID mismatch in UserInfo list'],
    steps: ['Open Library Settings > Permissions for this document library and click Check Permissions for the user.', 'If user was deleted and recreated with the same email, remove them from the hidden SharePoint User Information List (/_layouts/15/people.aspx?MembershipGroupId=0) and re-share.', 'Restore permission inheritance on subfolders where unique permissions were accidental.'],
    cmds: [
      ['Config / CLI', 'https://<tenant>.sharepoint.com/sites/<sitename>/_layouts/15/people.aspx?MembershipGroupId=0', 'Open hidden Site Collection UserInfo list to purge stale PUID']
    ],
    expected: 'User SID/PUID refreshes in SharePoint and document library opens immediately.',
    prevent: ['Manage permissions at the Site/Library level rather than breaking inheritance on deep nested folders'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['sharepoint access denied', 'membershipgroupid=0', 'puid mismatch', 'broken inheritance']
  },
  {
    id: 'M365-007',
    title: 'Conditional Access Error 53003 Blocking Legitimate Sign-In',
    category: 'Microsoft 365',
    errorCode: '53003',
    desc: 'User receives You cannot access this right now (Error Code: 53003) when signing into M365 from laptop or mobile.',
    symptoms: ['Sign-in blocked with Error Code 53003', 'Occurs on unmanaged device, new country IP, or uncompliant Intune endpoint'],
    causes: ['Conditional Access policy requires Compliant Device, Hybrid Entra Join, or Approved Country Named Location'],
    steps: ['Open Entra Admin Center > Sign-in logs for the user and click the Conditional Access tab on the failed event.', 'Identify the exact policy showing Failure (e.g., Require Intune Compliant Device or Block Non-US Locations).', 'Sync device compliance in Company Portal or follow travel exception workflow—do NOT disable the CA policy globally.'],
    cmds: [
      ['CMD', 'dsregcmd /status', 'Check AzureAdJoined, DomainJoined, and WamDefaultSet status on Windows PC']
    ],
    expected: 'Root compliance gap (e.g., pending BitLocker/OS compliance sync) resolves and sign-in succeeds.',
    prevent: ['Use Conditional Access What-If tool before switching policies from Report-Only to On'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['53003', 'conditional access blocked', 'dsregcmd', 'compliant device']
  },
  {
    id: 'M365-008',
    title: 'Shared Mailbox Automapping Missing or Not Expanding in Outlook',
    category: 'Microsoft 365',
    desc: 'User granted Full Access to info@company.com does not see the shared mailbox in Outlook within 60 minutes.',
    symptoms: ['Shared mailbox never appears in left folder pane', 'Or expanding folder shows Cannot expand the folder'],
    causes: ['Replication delay (up to 60 min)', 'Automapping set to $false', 'User added via Security Group instead of direct user permission (Groups do not automap!)'],
    steps: ['Test access first in Outlook on the Web (Open another mailbox) to verify server-side permissions.', 'Note that granting Full Access via Mail-Enabled Security Group works but NEVER automaps—add shared mailbox manually in Account Settings > More Settings > Advanced, or assign direct user permission with -AutoMapping $true.'],
    cmds: [
      ['PowerShell', 'Add-MailboxPermission -Identity "info@company.com" -User "jsmith@company.com" -AccessRights FullAccess -AutoMapping $true', 'Grant FullAccess with Automapping']
    ],
    expected: 'Shared mailbox mounts automatically in Outlook and OWA.',
    prevent: ['Disable Download Shared Folders in Outlook if user has 5+ large shared mailboxes hitting 50 GB OST cap'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['shared mailbox not showing', 'automapping', 'cannot expand folder', 'add-mailboxpermission']
  },
  {
    id: 'M365-009',
    title: 'Teams Microphone or Camera Blocked in Meetings',
    category: 'Microsoft 365',
    desc: 'Participants cannot hear or see the user in Microsoft Teams despite headset working in other apps.',
    symptoms: ['Your microphone isnt working banner in Teams', 'Camera shows black screen'],
    causes: ['Windows Privacy settings block desktop app access to Microphone/Camera', 'Hardware privacy shutter or headset inline mute active', 'Wrong audio endpoint selected in Teams Device Settings'],
    steps: ['Check physical webcam privacy slider and headset inline mute button.', 'Open Windows Settings > Privacy & security > Microphone (and Camera) and enable Let desktop apps access your microphone.', 'Make a Test Call in Teams Settings > Devices to verify input levels.'],
    cmds: [
      ['CMD', 'start ms-settings:privacy-microphone', 'Open Windows Microphone Privacy Settings directly']
    ],
    expected: 'Teams Test Call echoes voice and video clearly.',
    prevent: ['Standardize certified Teams USB/DECT headsets across support teams'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['teams mic not working', 'teams camera black', 'privacy microphone']
  },
  {
    id: 'M365-010',
    title: 'Excel File Locked for Editing by Yourself or Former Session',
    category: 'Microsoft 365',
    desc: 'Opening a SharePoint/Teams Excel workbook displays File is locked for editing by another user (or your own name).',
    symptoms: ['Workbook opens Read-Only despite co-authoring support', 'Lock persists after closing Excel'],
    causes: ['Legacy .xls format (does not support co-authoring)', 'Workbook has legacy Shared Workbook feature enabled', 'Stale lock lease (~10 min) after laptop crash'],
    steps: ['Open the file in Excel for the Web first—this often clears stale desktop co-authoring locks immediately.', 'Convert legacy .xls files to modern .xlsx format.', 'Ensure legacy Review > Share Workbook (Legacy) is unchecked.'],
    cmds: [
      ['PowerShell', 'Stop-Process -Name "EXCEL" -Force -ErrorAction SilentlyContinue', 'Close hung local Excel background processes']
    ],
    expected: 'Multi-user real-time co-authoring works seamlessly across desktop and web.',
    prevent: ['Store modern .xlsx/.docx formats in SharePoint/Teams and keep AutoSave enabled'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['excel locked for editing', 'sharepoint file locked', 'co-authoring']
  },
  {
    id: 'M365-011',
    title: 'External Guests Cannot Join Teams Channel or Access Shared File',
    category: 'Microsoft 365',
    desc: 'External client receives Your organization policies do not allow you to access this content when clicking a SharePoint/Teams link.',
    symptoms: ['External guest stuck in redemption loop or blocked', 'Sharing option Anyone or New and existing guests greyed out'],
    causes: ['Site-level external sharing is stricter than Tenant-level sharing setting', 'Entra B2B Cross-Tenant Access / External Collaboration setting restricts guest domains'],
    steps: ['Check SharePoint Admin Center > Sites > Active sites > select site > Settings > External file sharing (Site setting must be enabled separately from Tenant!).', 'Verify Entra ID > External Identities > External collaboration settings allow invited domains.', 'If guest switched jobs/tenants, delete stale B2B guest object in Entra ID and re-invite.'],
    cmds: [
      ['PowerShell', 'Get-SPOSite -Identity "https://contoso.sharepoint.com/sites/ProjectX" | Select SharingCapability', 'Check SharePoint site sharing level']
    ],
    expected: 'External guest redeems B2B invite via OTP/Entra login and accesses shared workspace.',
    prevent: ['Use Entra Access Reviews every 90 days to automatically expire inactive external guests'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['external sharing greyed out', 'b2b guest blocked', 'sharingcapability']
  },
  {
    id: 'M365-012',
    title: 'Microsoft Intune Company Portal Device Stuck on Non-Compliant',
    category: 'Microsoft 365',
    desc: 'Windows laptop enrolled in Intune shows Not Compliant, blocking Outlook and Teams via Conditional Access.',
    symptoms: ['Company Portal shows red Non-Compliant status', 'Compliance check stalls even after installing updates'],
    causes: ['BitLocker encryption still in progress or Secure Boot off', 'Minimum OS build requirement not met', 'Intune Management Extension sync delayed'],
    steps: ['Open Company Portal > Devices > select PC to view the exact failing compliance rule (BitLocker, Firewall, Antivirus, OS Version).', 'Remediate the specific failing control (e.g., finish BitLocker encryption or install cumulative OS patch).', 'Click Check access in Company Portal to force immediate compliance evaluation.'],
    cmds: [
      ['PowerShell', 'Get-Service IntuneManagementExtension | Restart-Service', 'Trigger Intune policy sync'],
      ['CMD', 'manage-bde -status C:', 'Verify BitLocker reaches 100% Fully Encrypted']
    ],
    expected: 'Device flips to Compliant within 2-5 minutes and Conditional Access unblocks M365.',
    prevent: ['Configure a 24-hour Grace Period on non-critical OS patch compliance policies so users get warned before lockout'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['intune not compliant', 'company portal check access', 'intunemanagementextension']
  },
  {
    id: 'M365-013',
    title: 'Exchange Online Mailbox Full (100 GB Quota Reached)',
    category: 'Microsoft 365',
    errorCode: '552 5.2.2',
    desc: 'Executive mailbox hits 50 GB or 100 GB hard limit, rejecting inbound mail with 552 5.2.2 Mailbox full.',
    symptoms: ['Cannot send or receive emails', 'Recoverable Items (Litigation Hold) or Inbox at 99-100 GB'],
    causes: ['Mailbox quota exhausted (50 GB Business Basic/Standard, 100 GB E3/E5/Exchange Plan 2)', 'Online Archive not enabled'],
    steps: ['Check current mailbox and RecoverableItems storage usage.', 'Enable In-Place / Online Archiving (gives additional 50 GB-1.5 TB auto-expanding archive depending on license).', 'Assign an MRM Retention Policy (e.g., Move >2 years to Archive) and trigger Start-ManagedFolderAssistant for immediate processing.'],
    cmds: [
      ['PowerShell', 'Get-EXOMailboxStatistics -Identity "ceo@company.com" | Select TotalItemSize, TotalDeletedItemSize', 'Check mailbox and recoverable items size'],
      ['PowerShell', 'Enable-Mailbox -Identity "ceo@company.com" -Archive', 'Enable Exchange Online Archive'],
      ['PowerShell', 'Start-ManagedFolderAssistant -Identity "ceo@company.com"', 'Force immediate archive move']
    ],
    expected: 'Older items move automatically to Online Archive and primary mailbox drops well below quota.',
    prevent: ['Enable Online Archive proactively when mailboxes cross 75% quota'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['mailbox full', '552 5.2.2', 'online archive', 'start-managedfolderassistant']
  },

  // ================= 7. Outlook & Exchange (13 issues) =================
  {
    id: 'OUT-001',
    title: 'Classic Outlook Stuck on Loading Profile or Processing Splash Screen',
    category: 'Outlook & Exchange',
    desc: 'Outlook hangs indefinitely at Loading Profile when opening on Windows 10/11.',
    symptoms: ['Splash screen freezes at Loading Profile or Processing', 'OWA works normally in browser'],
    causes: ['Faulty COM Add-in (antivirus, PDF, CRM plugin)', 'Corrupted local .ost cache or navigation pane XML', 'Graphics hardware acceleration conflict'],
    steps: ['Reset the navigation pane first with outlook.exe /resetnavpane.', 'Launch Outlook in Safe Mode (outlook.exe /safe) to test without COM add-ins; disable faulty add-ins under File > Options > Add-ins.', 'If Safe Mode also hangs, open Control Panel > Mail (Microsoft Outlook) > Show Profiles and create a clean new Outlook profile.'],
    cmds: [
      ['CMD', 'taskkill /f /im outlook.exe', 'Close hung Outlook process'],
      ['CMD', 'outlook.exe /resetnavpane', 'Repair corrupted navigation pane'],
      ['CMD', 'outlook.exe /safe', 'Test launch without COM add-ins']
    ],
    expected: 'Outlook opens cleanly within 3-5 seconds and syncs folders.',
    prevent: ['Keep local OST size under 25 GB using the Cached Exchange Mode sync slider (e.g., 1 Year)'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['outlook not opening', 'stuck on loading profile', 'outlook /safe', 'resetnavpane']
  },
  {
    id: 'OUT-002',
    title: 'Outlook Status Bar Stuck on Disconnected or Trying to Connect',
    category: 'Outlook & Exchange',
    desc: 'Bottom right status bar in Outlook reads Disconnected, Need Password, or Trying to connect while internet works.',
    symptoms: ['Emails pile up in Outbox without sending', 'Clicking Need Password flashes a blank white dialog and closes'],
    causes: ['Work Offline accidentally toggled on', 'Corrupted Modern Authentication WAM token', 'IPv6/Autodiscover resolution failure'],
    steps: ['Check Send / Receive tab and ensure Work Offline is NOT highlighted.', 'Hold Ctrl + Right-click the Outlook system tray icon and run Test E-mail AutoConfiguration.', 'Sign out of Office, clear Windows Credential Manager MSOffice16 entries, and restart Windows Token Broker.'],
    cmds: [
      ['CMD', 'cmdkey /list | findstr /i "Office"', 'Inspect cached Office credentials'],
      ['PowerShell', 'Get-AppxPackage Microsoft.AAD.BrokerPlugin | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}', 'Repair Entra WAM broker plugin']
    ],
    expected: 'Status bar updates to Connected to: Microsoft Exchange and Outbox flushes.',
    prevent: ['Ensure autodiscover.company.com CNAME points cleanly to autodiscover.outlook.com'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['outlook disconnected', 'need password blank window', 'trying to connect', 'brokerplugin']
  },
  {
    id: 'OUT-003',
    title: 'Outlook OST File Reached 50 GB Maximum Size Limit',
    category: 'Outlook & Exchange',
    desc: 'Outlook stops receiving new mail and throws Cannot expand the folder or OST has reached maximum size.',
    symptoms: ['Send/Receive error 0x8004060C', 'OST file in %LOCALAPPDATA%\\Microsoft\\Outlook is ~49.9 GB'],
    causes: ['Default Outlook max OST size is 50 GB', 'Sync slider set to All combined with Download Shared Folders enabled'],
    steps: ['Open File > Account Settings > Account Settings > double-click Exchange account.', 'Lower Download email for the past slider from All to 1 Year or 6 Months.', 'Click More Settings > Advanced and uncheck Download shared folders.', 'Close Outlook, rename the bloated .ost to .ost.bak, reopen Outlook to build a lean fresh OST, then delete .ost.bak.'],
    cmds: [
      ['PowerShell', 'Get-ChildItem "$env:LOCALAPPDATA\\Microsoft\\Outlook\\*.ost" | Select Name, @{N="SizeGB";E={[math]::Round($_.Length/1GB,2)}}', 'Check exact OST file size in GB']
    ],
    warn: 'Verify all Outbox / Sync Issues local-only drafts are sent or backed up before renaming an .ost file.',
    expected: 'New OST builds at 5-12 GB and Outlook performance improves dramatically.',
    prevent: ['Enforce 1-year Cached Exchange Mode sync slider and disable Download Shared Folders via Office GPO/Intune'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['ost 50gb limit', '0x8004060c', 'download shared folders', 'rebuild ost']
  },
  {
    id: 'OUT-004',
    title: 'Outlook Search Returning No Results or Incomplete Matches',
    category: 'Outlook & Exchange',
    desc: 'Searching for known recent emails in Outlook returns No results even though messages are visible in Inbox.',
    symptoms: ['Instant Search returns zero results or stops at last month', 'Indexing Status shows thousands of items remaining forever'],
    causes: ['Corrupted Windows.edb search index database', 'Per-mailbox cloud search scope glitch'],
    steps: ['Check File > Options > Search > Indexing Options to see if items remaining is stuck.', 'Click Advanced > Rebuild under Indexing Options (or stop WSearch and recreate Windows.edb if corrupted).', 'Use Outlook on the Web immediately while background re-indexing finishes.'],
    cmds: [
      ['PowerShell', 'Stop-Service WSearch -Force; Remove-Item "C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\Windows.edb" -Force -ErrorAction SilentlyContinue; Start-Service WSearch', 'Rebuild corrupted Windows Search database']
    ],
    warn: 'Rebuilding Windows.edb causes high background CPU/disk indexing for 30-90 minutes.',
    expected: 'Outlook Instant Search returns complete, instant results across Inbox and Sent Items.',
    prevent: ['Keep OST files lean (<20 GB) so Windows Search index stays responsive'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['outlook search not working', 'no results outlook', 'windows.edb', 'rebuild index']
  },
  {
    id: 'OUT-005',
    title: 'Cannot Send As or Send on Behalf of Shared Mailbox (550 5.7.60 / 0x80070005)',
    category: 'Outlook & Exchange',
    errorCode: '550 5.7.60',
    desc: 'Email sent from a shared mailbox bounces immediately with You do not have permission to send the message on behalf of the specified user.',
    symptoms: ['NDR bounce 550 5.7.60 or 0x80070005-000004dc-00000524', 'Full Access works for reading, but sending fails'],
    causes: ['Full Access permission only grants read/manage—Send As is a separate Exchange permission', 'Typed manual From address instead of picking from Offline Global Address List (OAB)'],
    steps: ['Grant explicit SendAs (or GrantSendOnBehalfTo) permission in Exchange Online.', 'In Outlook, delete the cached autocomplete From entry (click X), click From > Other Email Address > From..., and pick the shared mailbox from the Global Address List (not Offline Address Book).', 'Download fresh Address Book in Send/Receive > Download Address Book.'],
    cmds: [
      ['PowerShell', 'Add-RecipientPermission -Identity "support@company.com" -Trustee "jsmith@company.com" -AccessRights SendAs -Confirm:$false', 'Grant SendAs permission in Exchange Online']
    ],
    expected: 'Outbound messages send cleanly from support@company.com without NDR bounces.',
    prevent: ['Always pair FullAccess + SendAs in onboarding runbooks when staff must reply from shared queues'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['send as permission', '550 5.7.60', 'on behalf of bounce', 'add-recipientpermission']
  },
  {
    id: 'OUT-006',
    title: 'Calendar Meeting Invites Disappearing or Not Showing for Delegates',
    category: 'Outlook & Exchange',
    desc: 'Executive reports missing meeting invitations or calendar conflicts after assigning an assistant delegate.',
    symptoms: ['Meeting invites skip Inbox or go straight to Deleted Items', 'Delegate and Manager calendars show mismatched updates'],
    causes: ['Delegate Delivery option set to My delegates only', 'Executive editing calendar simultaneously from Apple iOS built-in Calendar app (ActiveSync bug)'],
    steps: ['Check File > Account Settings > Delegate Access and set delivery to My delegates and send me a copy of meeting requests.', 'Ensure both Executive and Assistant use the official Outlook Mobile app on iOS/Android rather than native OS calendar apps.', 'Enable Shared Calendar Improvements in Outlook Account Settings > More Settings > Advanced.'],
    cmds: [
      ['PowerShell', 'Get-MailboxFolderPermission -Identity "exec@company.com:\\Calendar"', 'Audit exact calendar delegate permissions &SharingPermissionFlags']
    ],
    expected: 'Both executive and delegate receive invites reliably without phantom cancellations.',
    prevent: ['Standardize on Outlook for iOS/Android for all executives with calendar delegates'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['missing calendar invites', 'delegate access', 'shared calendar improvements']
  },
  {
    id: 'OUT-007',
    title: 'Autocomplete Suggested Contacts Missing orSending to Old Employee Email (IMCEAEX Bounce)',
    category: 'Outlook & Exchange',
    errorCode: 'IMCEAEX',
    desc: 'Sending an email to an internal or recreated contact bounces immediately with IMCEAEX-_O=EXCHANGELABS... 550 5.1.11.',
    symptoms: ['NDR bounce showing long LegacyExchangeDN string starting with IMCEAEX', 'Typing full email fails until cached chip is deleted'],
    causes: ['Outlook AutoComplete cache stores stale LegacyExchangeDN X500 address after mailbox migration or recreation'],
    steps: ['Have the sender compose a new email, type the recipient name, and click the X next to the suggested entry to purge the stale LegacyExchangeDN.', 'Select the recipient fresh from the Global Address List.', 'For permanent org-wide fix so nobody else bounces, convert the IMCEAEX string into an x500: proxyAddress on the target mailbox!'],
    cmds: [
      ['PowerShell', '# Convert _ to /, +20 to space, +28 to (, +29 to ) and add x500: alias:\nSet-Mailbox jsmith -EmailAddresses @{Add="x500:/o=ExchangeLabs/ou=Exchange Administrative Group.../cn=Recipients/cn=..."}', 'Add legacy x500 alias so all senders succeed']
    ],
    expected: 'Both manual replies and existing cached autocomplete entries deliver without IMCEAEX bounces.',
    prevent: ['Preserve LegacyExchangeDN as x500 aliases during tenant-to-tenant mailbox migrations'],
    diff: 'Advanced',
    time: '10-15 minutes',
    tags: ['imceaex', '550 5.1.11', 'legacyexchangedn', 'x500', 'autocomplete bounce']
  },
  {
    id: 'OUT-008',
    title: 'Out of Office (Automatic Replies) Cannot Be Displayed Error in Outlook',
    category: 'Outlook & Exchange',
    desc: 'Clicking File > Automatic Replies throws Your automatic reply settings cannot be displayed because the server is currently unavailable.',
    symptoms: ['Automatic Replies dialog fails in desktop Outlook', 'Automatic Replies works inside Outlook on the Web'],
    causes: ['Autodiscover hitting on-prem SCP or public website HTTPS port 443 before Office 365', 'Broken EWS URL resolution'],
    steps: ['Have the user set urgent Out of Office immediately in Outlook on the Web (Settings > Mail > Automatic replies).', 'Run Outlook Test E-mail AutoConfiguration to see which URL fails.', 'Exclude Root Domain lookup via ExcludeHttpsRootDomain=1 if company website intercepts https://company.com/autodiscover/autodiscover.xml.'],
    cmds: [
      ['PowerShell', 'New-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Office\\16.0\\Outlook\\AutoDiscover" -Name "ExcludeHttpsRootDomain" -Value 1 -PropertyType DWORD -Force', 'Skip root domain HTTPS autodiscover hang']
    ],
    expected: 'Autodiscover resolves Exchange Online EWS immediately and Automatic Replies opens.',
    prevent: ['Ensure web servers return HTTP 404 fast (not 200 HTML login page) on /autodiscover/autodiscover.xml'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['automatic replies cannot be displayed', 'out of office error', 'excludehttpsrootdomain', 'autodiscover']
  },
  {
    id: 'OUT-009',
    title: 'External Recipients Receiving Winmail.dat Instead of PDF Attachments',
    category: 'Outlook & Exchange',
    desc: 'External clients on Apple Mail, Gmail, or Linux receive a single unreadable winmail.dat file instead of PDF/Word attachments.',
    symptoms: ['Attachments turn into winmail.dat for outside recipients', 'Internal Outlook recipients see attachments normally'],
    causes: ['Message composed in Outlook Rich Text Format (RTF / TNEF) instead of HTML'],
    steps: ['In Outlook > File > Options > Mail, set Compose messages in this format to HTML.', 'Scroll down to Message format > When sending messages in Rich Text format to Internet recipients, select Convert to HTML format.', 'Disable TNEF globally on Remote Domain Default in Exchange Online so no user can trigger winmail.dat.'],
    cmds: [
      ['PowerShell', 'Set-RemoteDomain Default -TNEFEnabled $false', 'Disable TNEF winmail.dat org-wide for external recipients']
    ],
    expected: 'All external recipients receive standard MIME PDF/Office attachments cleanly.',
    prevent: ['Keep Set-RemoteDomain Default -TNEFEnabled $false enforced at tenant level'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['winmail.dat', 'tnef', 'missing pdf attachment', 'set-remotedomain']
  },
  {
    id: 'OUT-010',
    title: 'Malicious Inbox Rule Forwarding Emails After Phishing Compromise',
    category: 'Outlook & Exchange',
    desc: 'User reports missing invoices/MFA emails and contacts receiving phishing replies, even after password reset.',
    symptoms: ['Incoming emails auto-mark as read and move to RSS Feeds or Conversation History', 'Hidden forwarding rule persists after password change'],
    causes: ['Attacker created hidden OWA/MAPI Inbox Rule (e.g., named "." or "\\") and persistent OAuth app consent'],
    steps: ['Revoke all active refresh tokens and require MFA re-registration immediately.', 'Inspect ALL Inbox rules via Exchange Online PowerShell (including -IncludeHidden rules invisible in Outlook UI!).', 'Delete malicious rules, check Mailbox ForwardingSmtpAddress, and audit unified sign-in logs.'],
    cmds: [
      ['PowerShell', 'Get-InboxRule -Mailbox "victim@company.com" -IncludeHidden | Select Name, Enabled, RedirectTo, ForwardTo, MoveToFolder', 'Audit hidden and visible inbox rules'],
      ['PowerShell', 'Get-Mailbox "victim@company.com" | Select ForwardingAddress, ForwardingSmtpAddress, DeliverToMailboxAndForward', 'Check mailbox-level forwarding']
    ],
    warn: 'Preserve rule details for incident response forensics before deleting.',
    expected: 'Attacker persistence rules and tokens are purged and unauthorized mail exfiltration stops.',
    prevent: ['Block auto-forwarding to external domains in Defender Outbound Anti-Spam policy'],
    diff: 'Advanced',
    time: '15-25 minutes',
    tags: ['hidden inbox rule', 'bec compromise', 'get-inboxrule -includehidden', 'email forwarding']
  },
  {
    id: 'OUT-011',
    title: 'PST Archive File Corrupted (Cannot Open Outlook Data File)',
    category: 'Outlook & Exchange',
    desc: 'Local .pst archive throws Errors have been detected in the file <path>.pst when expanding folders.',
    symptoms: ['Outlook refuses to open local .pst archive', 'Prompt recommends Inbox Repair Tool'],
    causes: ['PST stored on SMB network share or OneDrive synced folder causing write corruption', 'Unexpected power loss while Outlook was open'],
    steps: ['Close Outlook completely and copy a backup of the .pst file to a local non-synced folder (e.g., C:\\PST-Recovery).', 'Locate and run SCANPST.EXE (Microsoft Inbox Repair Tool) from the Office16 installation folder.', 'Run Scan and click Repair (repeat until 0 errors remain), then import into Online Archive.'],
    cmds: [
      ['PowerShell', 'Get-ChildItem "C:\\Program Files*\\Microsoft Office" -Recurse -Filter "SCANPST.EXE" -ErrorAction SilentlyContinue | Select FullName', 'Locate SCANPST.EXE binary']
    ],
    warn: 'Always copy the .pst file before running Repair. Never mount .pst files over network shares.',
    expected: 'PST B-tree headers repair cleanly and archived emails become readable again.',
    prevent: ['Ingest legacy local PST files into Exchange Online Archive and retire local PST usage'],
    diff: 'Beginner',
    time: '15-25 minutes',
    tags: ['scanpst', 'pst corrupted', 'errors have been detected in the file']
  },
  {
    id: 'OUT-012',
    title: 'Conference Room Mailbox Auto-Accepting Without Showing Organizer or Subject',
    category: 'Outlook & Exchange',
    desc: 'Room calendar displays Busy instead of the organizer name, making it impossible to see who booked the room.',
    symptoms: ['Conference room calendar blocks show only Busy to staff', 'Or meeting subjects appear publicly when they should be hidden'],
    causes: ['Default FolderUser permission on Room:\\Calendar is AvailabilityOnly instead of LimitedDetails, combined with CalendarProcessing flags'],
    steps: ['Set Room mailbox Calendar folder Default permission to LimitedDetails so staff see Organizer + Location.', 'Verify Set-CalendarProcessing has AutomateProcessing AutoAccept, AddOrganizerToSubject $true, and DeleteSubject $true (protects confidential titles while showing who booked it!).'],
    cmds: [
      ['PowerShell', 'Set-MailboxFolderPermission -Identity "confroom1@company.com:\\Calendar" -User Default -AccessRights LimitedDetails', 'Allow staff to see booking organizer'],
      ['PowerShell', 'Set-CalendarProcessing -Identity "confroom1@company.com" -AutomateProcessing AutoAccept -AddOrganizerToSubject $true -DeleteSubject $true', 'Configure clean auto-accept']
    ],
    expected: 'Room auto-accepts non-conflicting bookings and displays Organizer name to all employees.',
    prevent: ['Apply standardized Set-CalendarProcessing baseline script whenever creating Resource Mailboxes'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['room mailbox busy', 'set-calendarprocessing', 'limiteddetails', 'conference room']
  },
  {
    id: 'OUT-013',
    title: 'Hyperlinks in Outlook Emails Fail to Open Browser',
    category: 'Outlook & Exchange',
    desc: 'Clicking any https:// link inside Outlook displays Your organization policies are preventing us from completing this action.',
    symptoms: ['Error popup when clicking any URL in Outlook', 'Copying and pasting URL into browser works'],
    causes: ['Broken HKCU\\Software\\Classes\\.html default browser association after uninstalling Chrome/Firefox'],
    steps: ['Open Windows Settings > Apps > Default apps.', 'Select Microsoft Edge or Google Chrome and click Set default at the top so HTTP, HTTPS, .htm, and .html protocol handlers rebind cleanly.', 'Test clicking a known safe URL in Outlook.'],
    cmds: [
      ['CMD', 'start ms-settings:defaultapps', 'Open Windows Default Apps settings']
    ],
    expected: 'Email links launch immediately in the default browser.',
    prevent: ['Deploy clean DefaultAssociationsConfiguration XML via GPO/Intune if managing enterprise browsers'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['outlook links not opening', 'organization policies preventing us', 'default browser']
  },

  // ================= 8. Laptop & Desktop Hardware (13 issues) =================
  {
    id: 'HW-001',
    title: 'Laptop Plugged In, Not Charging (Stuck at 0% or 55%)',
    category: 'Laptop & Desktop Hardware',
    desc: 'USB-C or barrel AC adapter is connected, power LED lights up, but battery percentage never increases.',
    symptoms: ['Battery tooltip says Plugged in, not charging or Smart charging active', 'Laptop shuts off instantly if unplugged'],
    causes: ['Undersized phone USB-C charger (<45W/65W PD)', 'OEM BIOS Battery Health Charge Threshold set to 60%/80%', 'Worn-out Li-Ion battery cells or wedged Embedded Controller (EC)'],
    steps: ['Verify genuine 65W/90W/130W USB-C PD charger connected directly to laptop (bypass unpowered hub).', 'Generate a Windows Battery Report to compare DESIGN CAPACITY vs FULL CHARGE CAPACITY.', 'Perform an Embedded Controller (EC) hard reset: shut down, unplug AC, hold Power button for 30 full seconds, reconnect AC, and boot.'],
    cmds: [
      ['CMD', 'powercfg /batteryreport /output "%USERPROFILE%\\Desktop\\battery-report.html"', 'Generate detailed battery wear report']
    ],
    expected: 'EC resets charging IC and battery charges normally (or battery wear >40% confirms RMA replacement).',
    prevent: ['Update laptop BIOS and Thunderbolt/PD controller firmware regularly'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['plugged in not charging', 'batteryreport', 'ec reset', 'usb-c charger']
  },
  {
    id: 'HW-002',
    title: 'Dual External Monitors Flickering or Blacking Out on USB-C / Thunderbolt Dock',
    category: 'Laptop & Desktop Hardware',
    desc: 'External 1440p/4K displays connected to a USB-C dock randomly go black for 2-3 seconds several times an hour.',
    symptoms: ['Brief 2-second blackouts on external monitors', 'Occurs more often at 4K 60Hz or dual QHD'],
    causes: ['DisplayPort DSC / HBR2 bandwidth saturation', 'Outdated dock MST hub firmware', 'Cheap unshielded HDMI/DP cable picking up EMI from gas-spring monitor arm'],
    steps: ['Update BOTH the laptop GPU/Thunderbolt drivers AND the USB-C Dock firmware utility (Dell WD19/WD22, Lenovo ThinkPad Dock, HP G5).', 'Lower secondary monitor from 120Hz/10-bit to 60Hz 8-bit RGB to fit DP 1.4 lane budget.', 'Replace passive adapters with VESA-certified DisplayPort cables.'],
    cmds: [
      ['PowerShell', 'Get-PnpDevice -Class Display | Select FriendlyName, Status, DriverVersion', 'Verify installed GPU driver versions']
    ],
    expected: 'Dual monitors hold rock-solid sync all day without signal dropouts.',
    prevent: ['Include Dock Firmware updates in quarterly endpoint maintenance cycles'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['monitor flickering', 'usb-c dock black screen', 'mst firmware', 'thunderbolt dock']
  },
  {
    id: 'HW-003',
    title: 'No Bootable Device Found / Boot Device Not Found (3F0 / PXE Boot)',
    category: 'Laptop & Desktop Hardware',
    desc: 'Workstation boots straight to UEFI BIOS or No Bootable Device Found instead of Windows.',
    symptoms: ['Black screen: No bootable devices found or BootDevice Not Found (3F0)', 'Attempts IPv4 PXE network boot and fails'],
    causes: ['BIOS reset flipped Storage Controller between RAID On (Intel VMD) and AHCI', 'Loose M.2 NVMe SSD screw or failed SSD controller', 'Corrupted UEFI BCD boot entry'],
    steps: ['Enter UEFI BIOS Setup (F2 / F10 / F12) and check System Information to see if the M.2 NVMe SSD is physically detected.', 'If SSD IS detected, toggle SATA/NVMe Operation Mode (Intel VMD / RAID On <-> AHCI) to match how Windows was originally installed.', 'If SSD is NOT detected in BIOS at all, reseat the M.2 drive or replace failed SSD under warranty.'],
    cmds: [
      ['CMD', '# From Windows Recovery USB if drive is visible:\nbootrec /rebuildbcd && bcdboot C:\\Windows /s S: /f UEFI', 'Recreate UEFI boot entry if BCD was wiped']
    ],
    warn: 'Disconnect AC and disable internal battery in BIOS Service Mode before opening laptop bottom cover to reseat M.2 SSD.',
    expected: 'UEFI Windows Boot Manager locates NVMe OS partition and boots cleanly.',
    prevent: ['Monitor NVMe SMART Percentage Used and Spare Capacity via RMM alerts'],
    diff: 'Intermediate',
    time: '15-25 minutes',
    tags: ['no bootable device', '3f0', 'intel vmd', 'ahci vs raid', 'bcdboot']
  },
  {
    id: 'HW-004',
    title: 'CPU Thermal Throttling: Laptop Fan Loud and Clock Stuck at 0.40 GHz',
    category: 'Laptop & Desktop Hardware',
    desc: 'Laptop fan spins at maximum RPM while Task Manager shows CPU clock locked at 0.39-0.78 GHz (BD PROCHOT).',
    symptoms: ['Extreme sluggishness even at 15% CPU utilization', 'Task Manager Performance tab shows Speed: 0.40 GHz'],
    causes: ['Dust-clogged heatsink fins and dried thermal paste', 'Faulty VRM/battery thermistor asserting BD PROCHOT flag', 'Intel Dynamic Tuning / Power Management driver crash'],
    steps: ['Inspect intake/exhaust vents and clear dust buildup with compressed air (holding fan blades gently so they do not overspin).', 'Update BIOS and Intel Dynamic Platform and Thermal Framework (DPTF / IPF) drivers.', 'Perform EC power flea-drain reset if stuck at 0.40 GHz while cool to touch; repaste heatsink if core temps hit 98-100°C.'],
    cmds: [
      ['PowerShell', 'Get-CimInstance CIM_Processor | Select Name, CurrentClockSpeed, MaxClockSpeed', 'Check live vs rated CPU clock in MHz']
    ],
    warn: 'Never let compressed air spin laptop fans uncontrolled—back-EMF can damage fan controller headers.',
    expected: 'CPU boosts normally to rated turbo frequencies and temperatures stay within 65-85°C under load.',
    prevent: ['Educate users not to block bottom intake vents on soft bedding/couches'],
    diff: 'Intermediate',
    time: '15-30 minutes',
    tags: ['0.40 ghz', 'thermal throttling', 'bd prochot', 'laptop overheating']
  },
  {
    id: 'HW-005',
    title: 'Desktop Powers On with Black Screen and DRAM / VGA Debug LED Lit',
    category: 'Laptop & Desktop Hardware',
    desc: 'Desktop fans spin, keyboard NumLock does not respond, and monitors show No Signal (POST failure).',
    symptoms: ['Fans spin, zero BIOS splash screen, NumLock unresponsive', 'Motherboard diagnostic LED or beep code indicates DRAM or VGA'],
    causes: ['Monitor plugged into motherboard HDMI instead of discrete GPU DP/HDMI', 'Oxidized or unseated DDR4/DDR5 DIMM after moving PC', 'Corrupted CMOS XMP training'],
    steps: ['Verify display cables are plugged into the horizontal discrete graphics card ports, not vertical motherboard ports.', 'Power off, unplug AC, press power button for 10s, and reseat RAM modules firmly in slots A2/B2 (test 1 stick in A2 if needed).', 'Clear CMOS jumper or remove CR2032 battery for 60 seconds to reset memory training.'],
    cmds: [
      ['PowerShell', '# Once booted into Windows:\nGet-CimInstance Win32_PhysicalMemory | Select BankLabel, Capacity, ConfiguredClockSpeed, PartNumber', 'Verify all DIMM channels enumerated']
    ],
    warn: 'Always ground yourself against unpainted chassis metal before handling RAM or PCIe components.',
    expected: 'System completes POST, NumLock toggles cleanly, and full RAM capacity displays.',
    prevent: ['Secure heavy GPUs during office relocations to prevent PCIe/DIMM flex'],
    diff: 'Beginner',
    time: '15-20 minutes',
    tags: ['no post', 'black screen fans spin', 'reseat ram', 'dram led', 'clear cmos']
  },
  {
    id: 'HW-006',
    title: 'USB Device Not Recognized (Unknown USB Device Descriptor Request Failed)',
    category: 'Laptop & Desktop Hardware',
    errorCode: 'Code 43',
    desc: 'Connecting a headset, scanner, or dock triggers USB device not recognized toast and Code 43 in Device Manager.',
    symptoms: ['Unknown USB Device (Device Descriptor Request Failed) with yellow triangle', 'Works intermittently or fails on specific port'],
    causes: ['USB Selective Suspend power-state glitch', 'Unpowered USB hub voltage drop', 'Static latch-up in laptop USB root controller'],
    steps: ['Connect device directly to a motherboard/laptop USB port (bypass hubs and extension cables).', 'Uninstall the Code 43 Unknown USB Device in Device Manager and scan for hardware changes.', 'Perform full laptop shutdown + AC unplug + 20s power hold to discharge 5V USB rails.'],
    cmds: [
      ['PowerShell', 'Get-PnpDevice -PresentOnly | Where Status -eq "Error" | Select Class, FriendlyName, InstanceId', 'List hardware devices in Error state']
    ],
    expected: 'USB device enumerates VID/PID descriptor cleanly and loads driver.',
    prevent: ['Use externally powered USB 3.2 hubs for webcams, scanners, and audio interfaces'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['usb device not recognized', 'device descriptor request failed', 'code 43']
  },
  {
    id: 'HW-007',
    title: 'Laptop Keyboard Specific Keys Not Working or Typing Wrong Characters',
    category: 'Laptop & Desktop Hardware',
    desc: 'Certain keys fail to register, type double letters, or output numbers instead of U/I/O/J/K/L.',
    symptoms: ['Specific row/keys dead on built-in keyboard while external USB keyboard works', 'Or right-hand letters type numbers'],
    causes: ['Embedded NumLock toggled on compact keyboard', 'Filter Keys accessibility enabled', 'Liquid spill or ribbon cable damage on keyboard matrix'],
    steps: ['Test an external USB keyboard immediately—if external ALSO fails, check Filter Keys (Settings > Accessibility > Keyboard) or keyboard layout.', 'Press Fn + NumLock if U/I/O output 4/5/6.', 'Boot into BIOS setup or UEFI Diagnostics and test keys there; if dead inside BIOS, schedule palmrest/keyboard hardware replacement.'],
    cmds: [
      ['CMD', 'osk.exe', 'Launch On-Screen Keyboard for immediate emergency login/typing']
    ],
    expected: 'Software toggle resolved in 2 minutes, or hardware matrix failure confirmed via BIOS test.',
    prevent: ['Keep spare USB keyboards at Helpdesk for instant employee productivity while awaiting RMA'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['laptop keys not working', 'typing numbers instead of letters', 'osk', 'filter keys']
  },
  {
    id: 'HW-008',
    title: 'Modern Standby (S0 Low Power Idle) Draining Laptop Battery Inside Backpack',
    category: 'Laptop & Desktop Hardware',
    desc: 'Employee closes laptop lid at 90% battery and pulls a hot, dead laptop out of their bag 3 hours later.',
    symptoms: ['Laptop gets warm inside sleeve/bag while asleep', 'Battery drains 50-100% overnight'],
    causes: ['Windows Modern Standby (S0ix) wakes for network maintenance when plugged in right before closing lid'],
    steps: ['Run powercfg /sleepstudy and powercfg /requests to identify exact wake culprits.', 'Unplug USB-C charger BEFORE closing the laptop lid when packing into a bag (prevents AC-connected S0 maintenance mode!).', 'Configure Hibernate after 60 minutes on battery or lid-close = Hibernate for mobile travelers.'],
    cmds: [
      ['CMD', 'powercfg /a', 'Check supported sleep states (S0 Low Power Idle vs S3)'],
      ['CMD', 'powercfg /sleepstudy /output "%USERPROFILE%\\Desktop\\sleepstudy.html"', 'Generate Modern Standby drain report'],
      ['CMD', 'powercfg /lastwake', 'Check what woke the laptop last']
    ],
    expected: 'Laptop enters deep low-power/hibernate state in transit with zero thermal buildup.',
    prevent: ['Unplug AC adapter prior to closing lid when placing S0ix laptops into closed backpacks'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['hot laptop in bag', 'modern standby drain', 'sleepstudy', 's0 low power idle']
  },
  {
    id: 'HW-009',
    title: 'Bluetooth Mouse and Headset Lagging or Disconnecting Repeatedly',
    category: 'Laptop & Desktop Hardware',
    desc: 'Bluetooth cursor stutters and audio crackles whenever WiFi transfers data or USB 3.0 drives are plugged in.',
    symptoms: ['Bluetooth mouse jumps across screen', 'Bluetooth toggle vanishes or disconnects every 10 minutes'],
    causes: ['2.4 GHz radio interference from unshielded USB 3.0 hubs/drives or 2.4 GHz WiFi', 'Bluetooth adapter Allow computer to turn off this device power saving'],
    steps: ['Connect laptop WiFi to a 5 GHz or 6 GHz SSID instead of crowded 2.4 GHz.', 'Move USB 3.0 dongles/hubs away from Bluetooth receiver or use OEM Logi Bolt / Jabra Link dedicated dongle.', 'Uncheck Allow the computer to turn off this device to save power on the Intel/Realtek Wireless Bluetooth adapter in Device Manager.'],
    cmds: [
      ['PowerShell', 'Get-PnpDevice -Class Bluetooth | Where Status -ne "OK"', 'Check Bluetooth device errors']
    ],
    expected: 'Cursor movement is smooth at full polling rate and audio remains drop-free.',
    prevent: ['Deploy enterprise headsets with dedicated DECT/USB-C dongles rather than raw Bluetooth'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['bluetooth lagging', 'mouse stuttering', 'usb 3.0 2.4ghz interference']
  },
  {
    id: 'HW-010',
    title: 'CMOS Checksum Invalid / System Date Resetting to 01/01/2000 on Cold Boot',
    category: 'Laptop & Desktop Hardware',
    desc: 'Desktop prompts Press F1 to Run Setup on every morning power-on after AC strip is switched off.',
    symptoms: ['CMOS Checksum Error - Defaults Loaded at boot', 'BIOS settings and system clock reset when unplugged'],
    causes: ['Depleted 3V CR2032 coin-cell battery on motherboard (<2.6V)'],
    steps: ['Record any custom BIOS settings (RAID/AHCI, Virtualization, Boot Order).', 'Power down PC, unplug AC, discharge residual power, and replace the motherboard CR2032 3V lithium coin-cell battery.', 'Boot into BIOS, set accurate UTC/local date & time, verify storage mode, and Save & Exit.'],
    cmds: [
      ['PowerShell', 'w32tm /resync /force', 'Resync OS clock once booted']
    ],
    expected: 'BIOS retains firmware configuration and RTC clock across full AC power disconnects.',
    prevent: ['Replace CR2032 batteries proactively on desktops older than 5 years'],
    diff: 'Beginner',
    time: '10-15 minutes',
    tags: ['cmos battery', 'press f1 to continue', 'cr2032', 'bios resetting']
  },
  {
    id: 'HW-011',
    title: 'NVMe / SATA Drive Predicted Failure (SMART Status Bad: Backup and Replace)',
    category: 'Laptop & Desktop Hardware',
    desc: 'BIOS halts on boot with SMART Failure Predicted on Hard Disk or Windows Storage Health shows Warning.',
    symptoms: ['SMART Status BAD, Backup and Replace prompt during POST', 'Frequent I/O Event ID 7 (Bad Block) or Event ID 129 (StorAHCI/stornvme reset)'],
    causes: ['Flash NAND wear-out, reallocated bad sectors, or failing SSD controller'],
    steps: ['STOP running disk-heavy repair tools like chkdsk /r until critical user data is backed up!', 'Immediately copy critical unbacked-up files to network storage or OneDrive.', 'Verify SMART health counters and swap the failing SSD with a fresh imaged drive.'],
    cmds: [
      ['PowerShell', 'Get-StorageReliabilityCounter -PhysicalDisk (Get-PhysicalDisk) | Select DeviceId, Wear, ReadErrorsTotal, WriteErrorsTotal, Temperature', 'Inspect NVMe/SSD SMART counters']
    ],
    warn: 'Running chkdsk /r on a physically dying drive can push it over the edge before you save user files—always back up data FIRST.',
    expected: 'User data is preserved with zero loss before drive fails completely.',
    prevent: ['Enforce OneDrive Known Folder Move (KFM) so laptop SSD failures require zero data recovery'],
    diff: 'Intermediate',
    time: '30-45 minutes',
    tags: ['smart failure', 'event id 7 bad block', 'ssd dying', 'get-storagereliabilitycounter']
  },
  {
    id: 'HW-012',
    title: 'Touchpad Cursor Jumping or Unresponsive on Windows Laptop',
    category: 'Laptop & Desktop Hardware',
    desc: 'Precision touchpad freezes completely or moves erratically while typing.',
    symptoms: ['Touchpad dead while USB mouse works', 'Or cursor jumps randomly without touching pad (swollen battery pressure!)'],
    causes: ['Accidental Fn + Touchpad-Disable hotkey press', 'I2C HID Device driver fault', 'Swollen Li-Ion battery pressing upward underneath trackpad'],
    steps: ['Check physical chassis first: inspect if the trackpad clicks poorly or bulges upward—if the battery is swollen, power down immediately as a fire hazard!', 'Press the laptop Touchpad toggle key (often F6/F7/F9) or check Settings > Bluetooth & devices > Touchpad.', 'Uninstall and re-detect I2C HID Device in Device Manager if it shows Code 10.'],
    cmds: [
      ['CMD', 'start ms-settings:devices-touchpad', 'Open Windows Touchpad settings']
    ],
    warn: 'Never puncture or compress a swollen lithium-ion laptop battery—quarantine in a fire-safe container for hazmat RMA.',
    expected: 'Precision touchpad gestures and clicks work smoothly.',
    prevent: ['Enable Leave touchpad on when a mouse is connected if users accidentally assume it broke'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['touchpad not working', 'i2c hid code 10', 'swollen battery trackpad']
  },
  {
    id: 'HW-013',
    title: 'BitLocker / TPM Not Detected (TPM 2.0 Missing in tpm.msc)',
    category: 'Laptop & Desktop Hardware',
    desc: 'Windows 11 readiness check or BitLocker encryption fails with Compatible TPM cannot be found.',
    symptoms: ['tpm.msc reports Compatible TPM cannot be found', 'Windows Hello PIN setup fails with 0x80090016'],
    causes: ['Intel PTT / AMD fTPM disabled in BIOS after CMOS reset', 'Wedged TPM firmware state requiring full AC + battery discharge'],
    steps: ['Enter UEFI BIOS > Security and verify TPM 2.0 / Intel PTT / AMD fTPM is Enabled and Hidden=Off.', 'If enabled in BIOS but missing in Windows, shut down, unplug AC, hold Power button 30s (or use BIOS Reset Embedded Controller), and boot cold—never warm-reboot when resetting TPM state.'],
    cmds: [
      ['PowerShell', 'Get-Tpm', 'Inspect TpmPresent, TpmReady, and TpmEnabled flags']
    ],
    warn: 'NEVER click Clear TPM in BIOS if the OS drive is BitLocker-encrypted unless you have verified the 48-digit recovery key is in hand!',
    expected: 'Get-Tpm reports TpmPresent=True and TpmReady=True.',
    prevent: ['Lock BIOS setup with an IT supervisor password so users cannot disable TPM/Secure Boot'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['tpm not found', 'get-tpm', '0x80090016', 'intel ptt', 'ftpm']
  },

  // ================= 9. Printer & Scanner (13 issues) =================
  {
    id: 'PRT-001',
    title: 'Network Printer Shows Offline on Windows Despite Being Powered On',
    category: 'Printer & Scanner',
    desc: 'Office laser printer is awake and ready at the panel, but Windows clients show Printer Offline.',
    symptoms: ['Print jobs sit in queue with Printer Offline status', 'Other users or web UI might still work (or IP changed)'],
    causes: ['WSD (Web Services for Devices) port lost multicast tracking', 'SNMP Status Enabled misreporting empty tray as offline', 'Printer IP changed because DHCP reservation was missing'],
    steps: ['Ping the printer IP and open http://<printer-ip> in a browser to verify network reachability.', 'In Printer Properties > Ports, replace unreliable WSD-xxxx ports with a Standard TCP/IP Port using a reserved IP or FQDN.', 'Click Configure Port on the Standard TCP/IP Port and UNCHECK SNMP Status Enabled.', 'Restart Print Spooler service.'],
    cmds: [
      ['PowerShell', 'Get-PrinterPort | Select Name, Description, PrinterHostAddress', 'Inspect WSD vs Standard TCP/IP ports'],
      ['PowerShell', 'Restart-Service -Name Spooler -Force', 'Restart Windows Print Spooler']
    ],
    expected: 'Printer status flips immediately to Ready and queued documents print.',
    prevent: ['Always deploy Standard TCP/IP ports with DHCP reservations; disable WSD port discovery'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['printer offline', 'snmp status enabled', 'wsd port', 'spooler']
  },
  {
    id: 'PRT-002',
    title: 'Print Queue Stuck on Deleting - Printing (Corrupted Spooler Job)',
    category: 'Printer & Scanner',
    desc: 'A single corrupted PDF print job blocks the entire office print queue and refuses to cancel.',
    symptoms: ['Top job stuck on Deleting - Printing forever', 'Subsequent jobs queue behind it without printing'],
    causes: ['Print Spooler has locked .SHD and .SPL files inside C:\\Windows\\System32\\spool\\PRINTERS'],
    steps: ['Open an elevated Command Prompt or PowerShell (on the Print Server if shared, or local PC if direct IP).', 'Stop the Print Spooler service.', 'Delete stuck .SPL and .SHD spool files inside System32\\spool\\PRINTERS.', 'Start the Print Spooler service.'],
    cmds: [
      ['CMD', 'net stop spooler', 'Stop Print Spooler service'],
      ['CMD', 'del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"', 'Purge corrupted spool files'],
      ['CMD', 'net start spooler', 'Restart Print Spooler']
    ],
    warn: 'Running this on a shared Print Server clears ALL pending print jobs across queues on that server.',
    expected: 'Stuck job clears immediately and printer accepts new jobs.',
    prevent: ['Print complex flattened architectural PDFs using Print As Image in Adobe Acrobat'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['stuck print job', 'deleting printing', 'clear print spooler', 'system32 spool printers']
  },
  {
    id: 'PRT-003',
    title: 'Printer Printing Endless Pages of Garbled ASCII Symbols and Hieroglyphs',
    category: 'Printer & Scanner',
    desc: 'Sending a 2-page PDF causes the laser printer to spit out 100+ sheets with 1 line of smiley faces/symbols per page.',
    symptoms: ['Continuous pages with @PJL or PostScript/PCL garbage characters at top line', 'Canceling on PC does not stop pages already in printer RAM'],
    causes: ['Driver language mismatch (PCL6 vs PostScript) or corrupted TCP raw 9100 stream', 'Automated vulnerability scanner (Nessus/Qualys) probing TCP port 9100!'],
    steps: ['Pull the paper tray out immediately so the printer pauses without wasting a ream of paper!', 'Clear the PC/Server print spooler first, then power-cycle the physical printer to flush its onboard RAM.', 'Switch queue driver to vendor Universal Print Driver PCL6 (or PostScript if required) and exclude TCP 9100 / printer VLANs from Nessus active port scans!'],
    cmds: [
      ['PowerShell', 'Get-Printer | Select Name, DriverName, PortName', 'Verify installed print driver model']
    ],
    expected: 'Garbage output stops and documents render accurately.',
    prevent: ['Exclude printer subnets or TCP port 9100 from unauthenticated vulnerability scan sweeps'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['printer printing gibberish', 'random symbols', 'port 9100', 'nessus printer']
  },
  {
    id: 'PRT-004',
    title: 'Scan to Network Folder (SMB) Stopped Working on Multifunction Copier',
    category: 'Printer & Scanner',
    desc: 'Office Ricoh/Canon/HP/Konica MFP fails with Transmission Failed / Authentication Error when scanning to Windows file server.',
    symptoms: ['Printing works, Scan-to-Folder fails with Server Connection Error', 'Started after Windows Server upgrade or password rotation'],
    causes: ['Old copier firmware trying deprecated SMBv1 (disabled on modern Windows)', 'Service account password expired', 'DNS hostname resolution failing on copier'],
    steps: ['Log into the MFP web admin console and verify SMBv2/SMBv3 is enabled in SMB Client settings (NEVER re-enable SMBv1 on servers!).', 'Update the scan service account password if expired and set Password Never Expires with strict least-privilege ACLs on the Scans share only.', 'Use FQDN or static IP for the SMB path and verify NTFS Modify permission on target folder.'],
    cmds: [
      ['PowerShell', 'Get-SmbServerConfiguration | Select EnableSMB1Protocol, EnableSMB2Protocol', 'Confirm SMBv2/v3 active on file server'],
      ['PowerShell', 'Get-SmbSession | Where ClientUserName -like "*scanner*"', 'Check live SMB connection from MFP']
    ],
    warn: 'Never enable SMBv1 to fix old copiers—update copier firmware or switch to Scan-to-SFTP / HTTPS.',
    expected: 'Scanned PDFs land in user network folders within 3 seconds.',
    prevent: ['Update MFP firmware to support SMBv3 and TLS 1.2'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['scan to folder not working', 'smb scan failed', 'smbv1 copier']
  },
  {
    id: 'PRT-005',
    title: 'Scan to Email Failing on Copier After Microsoft 365 Basic Auth Deprecation',
    category: 'Printer & Exchange' as any,
    desc: 'Multifunction printer fails to email PDF scans via smtp.office365.com port 587 with 535 5.7.139 Authentication unsuccessful.',
    symptoms: ['Scan to Email fails with SMTP error 535 5.7.139', 'Printing works normally'],
    causes: ['Microsoft retired legacy Basic SMTP Auth across tenants; Security Defaults or Conditional Access blocks legacy SMTP'],
    steps: ['Option 1 (Modern): If MFP supports OAuth 2.0 SMTP, upgrade firmware and sign in via OAuth.', 'Option 2 (Direct Send / Relay for internal recipients): Point MFP SMTP server to your MX endpoint (<tenant>.mail.protection.outlook.com) on port 25 from your static office WAN IP and add that WAN IP to your SPF record (or Exchange Connector).', 'Option 3: Use Azure Communication Services Email / SMTP2GO with dedicated API relay credentials.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName company.com -Type TXT | Where Strings -match "spf1"', 'Verify static WAN IP is authorized in SPF']
    ],
    expected: 'Scan-to-Email delivers cleanly over TLS 1.2 without insecure legacy mailbox passwords.',
    prevent: ['Document all SMTP relay copiers before rotating ISP static WAN IPs'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['scan to email 535', '5.7.139', 'smtp.office365.com', 'direct send']
  },
  {
    id: 'PRT-006',
    title: 'Color Printer Only Printing in Black and White / Grayscale',
    category: 'Printer & Scanner',
    desc: 'Color laser MFP prints every document in monochrome even when user selects Color inside Word/Acrobat.',
    symptoms: ['Color dropdown missing or ignored in print dialog', 'Printer web UI shows full CMYK toner cartridges'],
    causes: ['Microsoft IPP Class Driver auto-installed instead of vendor PCL6 driver', 'Printing Defaults on Print Server locked to Mono', 'Device Type in Device Settings detected as Monochrome'],
    steps: ['Open Printer Properties > Advanced and check if Driver says Microsoft IPP Class Driver—if so, replace with OEM Universal/Model PCL6 driver.', 'Open Printer Properties > Device Settings tab and change Device Type from Auto Detect / Monochrome to Color.', 'Check Printing Preferences > Paper/Quality to ensure Black & White is not enforced.'],
    cmds: [
      ['PowerShell', 'Get-Printer | Select Name, DriverName', 'Identify generic IPP vs OEM driver']
    ],
    expected: 'Color selector appears in print preferences and CMYK jobs print in full color.',
    prevent: ['Configure Device Settings > Color on Print Server BEFORE sharing the queue to clients'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['color printer printing black and white', 'ipp class driver', 'device settings color']
  },
  {
    id: 'PRT-007',
    title: 'Vertical Black Streaks or Ghosting Repeating Down Printed/Scanned Pages',
    category: 'Printer & Scanner',
    desc: 'Every printed or ADF-scanned sheet has a thin vertical black line or repeating ghosted text every 3 inches.',
    symptoms: ['Sharp vertical line only when using top Automatic Document Feeder (ADF), clean on flatbed glass', 'Or smudges/repeating ghost text on every printed page'],
    causes: ['Tiny speck of correction fluid/ink on narrow ADF slit glass (for scans)', 'Worn imaging drum or fuser roller (for prints)'],
    steps: ['Isolate Scan vs Print: make 1 copy from the Flatbed glass vs 1 copy from the top ADF.', 'If line ONLY appears via ADF: clean the narrow 1cm strip of ADF slit glass on the left of the main glass with isopropyl alcohol and microfiber cloth!', 'If smudges/ghosting appear on all prints: check Supplies Status and replace the Imaging Drum or Fuser unit.'],
    cmds: [
      ['Config / CLI', 'Printer Panel > Maintenance > Print Quality Pages / Clean Fuser', 'Run built-in fuser/corona cleaning cycle']
    ],
    expected: 'ADF scans and laser prints come out crisp and streak-free.',
    prevent: ['Remind staff never to feed wet correction fluid or stapled sheets through the ADF'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['vertical line on scan', 'adf slit glass', 'fuser ghosting', 'toner streaks']
  },
  {
    id: 'PRT-008',
    title: 'Zebra / Thermal Label Printer Skipping Blank Labels or Printing Off-Center',
    category: 'Printer & Scanner',
    desc: 'Warehouse shipping label printer feeds 2-3 blank labels after every label or cuts barcodes in half.',
    symptoms: ['Barcodes shift vertically across perforation', 'Red status light blinks after printing 1 label'],
    causes: ['Media gap sensor uncalibrated after changing label roll brand', 'Windows driver page size stuck on 4x6 Letter instead of actual 4x6 / 2x1 label stock'],
    steps: ['Run physical Media Calibration on the Zebra printer (e.g., hold Feed/Pause + Cancel for 2 seconds or run ~JC ZPL calibration).', 'Set matching Label Width, Height, and Darkness in BOTH Printing Preferences AND Printer Properties > Advanced > Printing Defaults!', 'Clean adhesive residue off the black media gap sensor and platen roller with 99% isopropyl alcohol.'],
    cmds: [
      ['PowerShell', 'Get-PrintConfiguration -PrinterName "Zebra-Ship01"', 'Inspect active paper/label dimensions']
    ],
    expected: 'Every thermal label stops cleanly at the tear bar with scannable barcodes.',
    prevent: ['Lock label stock dimensions in Printing Defaults so new user profiles inherit 4x6 size'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['zebra skipping labels', 'label printer calibration', 'off center barcode']
  },
  {
    id: 'PRT-009',
    title: 'Paper Jam Error Persisting After Removing Torn Paper',
    category: 'Printer & Scanner',
    desc: 'Printer screen stays stuck on Paper Jam in Tray 2 / Rear Door even though no visible paper sheet remains.',
    symptoms: ['Clear Paper Jam error refuses to clear after opening/closing doors', 'Printer will not initialize engine'],
    causes: ['Tiny 5mm torn corner of paper blocking optical photo-interrupter flag', 'Dislodged plastic sensor actuator lever'],
    steps: ['Power off and unplug the printer before reaching near the hot fuser assembly!', 'Inspect Tray pickup rollers, duplex path, and fuser exit with a flashlight for tiny torn paper scraps.', 'Gently test that spring-loaded black plastic optical sensor flags spring back freely when touched, then close doors and power on.'],
    cmds: [
      ['Config / CLI', 'Hardware Safety Check: Allow fuser (200°C / 390°F) 10 minutes to cool before touching rear rollers', 'Thermal burn precaution']
    ],
    warn: 'Laser printer fuser assemblies operate around 200°C—unplug AC and let cool before inspecting rear exit rollers. Never use sharp metal tweezers on fuser film.',
    expected: 'Optical paper path sensors return to home position and printer reaches Ready.',
    prevent: ['Fan new reams of paper before loading and adjust tray side guides snug without bowing paper'],
    diff: 'Beginner',
    time: '10-15 minutes',
    tags: ['ghost paper jam', 'false paper jam', 'sensor flag', 'fuser jam']
  },
  {
    id: 'PRT-010',
    title: 'Extra Tray / Duplexer Unit Greyed Out in Windows Print Dialog',
    category: 'Printer & Scanner',
    desc: 'Hardware Tray 3 (550-sheet) and automatic 2-sided printing are physically installed, but Windows shows Not Installed.',
    symptoms: ['Two-sided printing option missing', 'Tray 3 missing from Paper Source list'],
    causes: ['Bidirectional Support failed or Installable Options in Printer Properties never updated'],
    steps: ['Open Control Panel / Settings > Printers & scanners > select Printer > Printer properties.', 'Switch to the Device Settings tab and scroll to Installable Options.', 'Set Tray 3 = Installed and Duplex Unit = Installed manually, then click Apply.'],
    cmds: [
      ['PowerShell', 'Get-PrinterProperty -PrinterName "HP-Floor2"', 'Query driver installable option properties']
    ],
    expected: 'All extra trays, staplers, and duplex options unlock immediately for users.',
    prevent: ['Configure Installable Options on the central Print Server right after mounting hardware accessories'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['duplex missing', 'tray 3 not showing', 'installable options']
  },
  {
    id: 'PRT-011',
    title: 'PDF Takes 5 Minutes Per Page to Print Over Network',
    category: 'Printer & Scanner',
    desc: 'Word documents print instantly, but multi-page PDF drawings pause 2-5 minutes between each sheet.',
    symptoms: ['Printer LCD flashes Processing... for minutes per page', 'Spool file balloons from 4 MB PDF to 800 MB spool'],
    causes: ['PostScript/PCL vector transparency flattening overloading printer onboard CPU/RAM', 'Spooling set to Start printing immediately instead of after last page'],
    steps: ['Switch driver from PostScript to PCL6 (or vice-versa for Adobe vector graphics) and test.', 'In Adobe Reader Print > Advanced, check Print As Image (300 dpi) so the fast PC CPU rasterizes complex layers instead of the slow printer CPU.', 'Ensure Spool print documents -> Start printing after last page is spooled is enabled on shared queues.'],
    cmds: [
      ['PowerShell', 'Get-Printer -Name "Plotter-Eng" | Select Name, DriverName, RenderingMode', 'Check SSR vs CSR rendering mode']
    ],
    expected: 'Complex PDF drawings spool swiftly and print at rated engine PPM.',
    prevent: ['Use Client-Side Rendering (CSR) with PCL6 for general office queues'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['slow pdf printing', 'print as image', 'spool size huge']
  },
  {
    id: 'PRT-012',
    title: 'Print Spooler Service Crashing Repeatedly (Event ID 7031 / 1000)',
    category: 'Printer & Scanner',
    errorCode: 'Event ID 7031',
    desc: 'spoolsv.exe terminates unexpectedly every few minutes, making all printers vanish from Windows.',
    symptoms: ['All printers disappear when opening Print dialog', 'Application log shows Faulting application spoolsv.exe and faulting driver DLL'],
    causes: ['Corrupted third-party V3 kernel/user-mode print driver DLL crashing spoolsv.exe', 'Print processor corruption'],
    steps: ['Check Application Event Log (Event ID 1000) to identify the exact Faulting module name (e.g., hppcp6.dll).', 'Isolate the buggy driver in Print Management (printmanagement.msc) > Drivers > right-click > Set Driver Isolation > Isolated!', 'Replace obsolete V3 driver with a modern V4 driver and purge old driver package.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Application"; ID=1000} -MaxEvents 10 | Where Message -match "spoolsv.exe" | Format-List TimeCreated, Message', 'Identify exact crashing print driver DLL'],
      ['PowerShell', 'Get-PrinterDriver | Select Name, MajorVersion, DriverIsolation', 'Audit V3 vs V4 drivers']
    ],
    expected: 'Isolated/updated driver stops crashing spoolsv.exe and print server stability returns to 100%.',
    prevent: ['Enable Driver Isolation = Isolated for any third-party V3 drivers on Windows Print Servers'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['spoolsv crashing', 'event 7031', 'driver isolation', 'printmanagement.msc']
  },
  {
    id: 'PRT-013',
    title: 'USB Desktop Scanner Not Detected in Windows Scan / NAPS2 (WIA Stopped)',
    category: 'Printer & Scanner',
    desc: 'Flatbed or document scanner powers on, shows in Device Manager, but scanning apps report No Scanner Found.',
    symptoms: ['Scanning software says No WIA/TWAIN scanner detected', 'Device shows connected over USB'],
    causes: ['Windows Image Acquisition (stisvc) service stopped or stuck', 'Shell Hardware Detection disabled', 'Missing manufacturer TWAIN/ISIS driver'],
    steps: ['Verify Windows Image Acquisition (WIA) and Shell Hardware Detection services are set to Automatic and Running.', 'Install full OEM TWAIN/WIA scanner driver (not just basic print driver).', 'Test scanning in NAPS2 or Windows Fax and Scan using TWAIN vs WIA profile.'],
    cmds: [
      ['PowerShell', 'Set-Service -Name stisvc -StartupType Automatic; Restart-Service -Name stisvc -Force', 'Restart Windows Image Acquisition (WIA) service']
    ],
    expected: 'Scanner enumerates in WIA/TWAIN dialogs and captures multi-page PDFs.',
    prevent: ['Connect high-speed document scanners directly to motherboard USB 3.0 ports'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['scanner not detected', 'wia service', 'stisvc', 'twain']
  },

  // ================= 10. Windows Server (13 issues) =================
  {
    id: 'SRV-001',
    title: 'Windows Server C: Drive Full (WinSxS & IIS Logs Exhausting OS Volume)',
    category: 'Windows Server',
    desc: 'Production Windows Server 2019/2022 OS partition hits 0 MB free, causing IIS, AD, or SQL services to stall.',
    symptoms: ['Low disk space alerts with <500 MB free on C:', 'Patch installations and log writes fail'],
    causes: ['Years of unpruned IIS logs in C:\\inetpub\\logs\\LogFiles', 'Superseded component store packages in C:\\Windows\\WinSxS', 'Large crash memory.dmp'],
    steps: ['Identify largest folders on C: WITHOUT manually deleting files inside C:\\Windows\\WinSxS or Installer!', 'Compress or purge old IIS logs older than 30 days.', 'Clean up superseded Windows Update components safely using DISM StartComponentCleanup.', 'Clear C:\\Windows\\Temp and expand VMDK/VHDX online if base OS disk was undersized (<80 GB).'],
    cmds: [
      ['PowerShell', 'Get-ChildItem C:\\inetpub\\logs\\LogFiles -Recurse -File -ErrorAction SilentlyContinue | Where LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -Force', 'Purge IIS logs older than 30 days'],
      ['CMD', 'Dism.exe /online /Cleanup-Image /StartComponentCleanup', 'Safely shrink WinSxS superseded components']
    ],
    warn: 'NEVER manually delete files from C:\\Windows\\WinSxS or C:\\Windows\\Installer—doing so breaks Windows servicing permanently.',
    expected: 'Several gigabytes of safe space are reclaimed without server downtime.',
    prevent: ['Redirect IIS, SQL, and app logs to dedicated D:/E: data volumes and schedule IIS log retention'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['windows server c drive full', 'winsxs cleanup', 'iis logs full', 'startcomponentcleanup']
  },
  {
    id: 'SRV-002',
    title: 'Volume Shadow Copy (VSS) Writers Failed: Waiting for Completion / Retryable Error',
    category: 'Windows Server',
    errorCode: '0x80042306',
    desc: 'Nightly Veeam/Azure Backup fails because Windows VSS writers (SqlServerWriter, NTDS, System Writer) are stuck in Failed state.',
    symptoms: ['Backup job fails with VSS error 0x80042306 or Writer failed', 'vssadmin list writers shows non-stable writers'],
    causes: ['Previous backup timed out under heavy I/O', 'Insufficient shadow storage space on volume', 'VSS writer service wedged'],
    steps: ['List all VSS writers to identify exact failing writers.', 'Check vssadmin list shadowstorage to ensure Diff Volume has >=15% max space.', 'Restart the specific corresponding service (e.g., Cryptographic Services for System Writer, SQL Server VSS Writer for SqlServerWriter) rather than rebooting the whole production server!'],
    cmds: [
      ['CMD', 'vssadmin list writers', 'Identify writers not in [1] Stable / No error state'],
      ['CMD', 'vssadmin list shadowstorage', 'Inspect shadow copy storage limits'],
      ['PowerShell', 'Restart-Service -Name CryptSvc, VSS, SQLWriter -Force -ErrorAction SilentlyContinue', 'Reset common VSS writers cleanly']
    ],
    warn: 'Never restart NTDS or production SQL Engine during business hours without change window—restart only SQLWriter/VSS/CryptSvc first.',
    expected: 'All VSS writers report State: [1] Stable, Last error: No error and backup succeeds.',
    prevent: ['Stagger heavy backup schedules so guest VM I/O stun stays under 2 seconds'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['vssadmin list writers', '0x80042306', 'vss writer failed', 'veeam vss']
  },
  {
    id: 'SRV-003',
    title: 'Windows Server Network Profile Stuck on Public Instead of DomainAuthenticated',
    category: 'Windows Server',
    desc: 'After a host reboot where server booted faster than Domain Controller, NIC locks into Public firewall profile blocking RDP/SMB/SQL.',
    symptoms: ['Server becomes unreachable over RDP and SMB after power outage reboot', 'Get-NetConnectionProfile shows NetworkCategory : Public on domain server'],
    causes: ['Network Location Awareness (NLA) probed for DC before DC finished booting and fell back to Public'],
    steps: ['Access server via VMware/Hyper-V console or iDRAC/iLO.', 'Confirm the Domain Controller is now up and reachable via DNS.', 'Restart the Network Location Awareness (NlaSvc) service (or bounce NIC) so NLA re-detects DomainAuthenticated!'],
    cmds: [
      ['PowerShell', 'Get-NetConnectionProfile', 'Check current NetworkCategory'],
      ['PowerShell', 'Restart-Service NlaSvc -Force', 'Force NLA to re-verify DomainAuthenticated profile']
    ],
    expected: 'NetworkCategory switches immediately to DomainAuthenticated and domain firewall rules resume.',
    prevent: ['Configure hypervisor boot order so Domain Controllers start 120s BEFORE member app servers; set NLA DNS probe retry policy'],
    diff: 'Intermediate',
    time: '5 minutes',
    tags: ['domain server public network', 'nlasvc', 'domainauthenticated', 'after power outage']
  },
  {
    id: 'SRV-004',
    title: 'IIS Application Pool Crashing with HTTP 503 Service Unavailable',
    category: 'Windows Server',
    errorCode: 'HTTP 503',
    desc: 'Internal web portal returns Service Unavailable (HTTP Error 503) because IIS Rapid-Fail Protection stopped the App Pool.',
    symptoms: ['Browser shows HTTP Error 503. The service is unavailable.', 'IIS Manager shows Application Pool in Stopped state'],
    causes: ['Service account password used for App Pool Identity expired or lacks Log on as a batch job', '32-bit DLL loaded without Enable 32-Bit Applications=True', 'Unhandled .NET exception loop'],
    steps: ['Check Windows System log (WAS Event IDs 5002, 5021, 5057) and Application log for the root crash cause.', 'If App Pool uses a custom AD service account, verify account is unlocked and password matches.', 'Start the Application Pool and browse localhost to verify HTTP 200.'],
    cmds: [
      ['PowerShell', 'Import-Module WebAdministration; Get-ChildItem IIS:\\AppPools | Select Name, State', 'Check stopped IIS App Pools'],
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="System"; ProviderName="Microsoft-Windows-WAS"} -MaxEvents 10 | Select TimeCreated, Id, Message', 'Read WAS crash reason'],
      ['PowerShell', 'Start-WebAppPool -Name "DefaultAppPool"', 'Start IIS Application Pool']
    ],
    expected: 'Application Pool stays in Started state and serves HTTP 200 responses.',
    prevent: ['Use gMSA (Group Managed Service Accounts) for IIS App Pool identities so passwords rotate automatically'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['http 503', 'iis app pool stopped', 'rapid-fail protection', 'was 5002']
  },
  {
    id: 'SRV-005',
    title: 'Windows Server Failover Cluster Node Isolated or Quorum Lost (Event 1135)',
    category: 'Windows Server',
    errorCode: 'Event ID 1135',
    desc: 'Clustered Hyper-V or SQL roles fail over unexpectedly because a cluster node was removed from active membership.',
    symptoms: ['Failover Cluster Manager shows node Down or Quarantined', 'System log reports Event ID 1135'],
    causes: ['Missed cluster heartbeat UDP 3343 due to NIC teaming/VLAN glitch or storage stun', 'Cloud/File Share Quorum Witness unreachable during 2-node split'],
    steps: ['Verify UDP port 3343 reachability across both Cluster/Management networks.', 'Check Get-ClusterQuorum to ensure File Share Witness or Cloud Witness is online and voting.', 'Clear node quarantine if recurring flaps placed the node in 2-hour quarantine.'],
    cmds: [
      ['PowerShell', 'Get-ClusterNode | Select Name, State, NodeWeight', 'Check cluster node states and votes'],
      ['PowerShell', 'Get-ClusterQuorum', 'Verify witness resource health'],
      ['PowerShell', 'Start-ClusterNode -ClearQuarantine', 'Clear quarantine after resolving network flap']
    ],
    warn: 'Never force-quorum on two isolated nodes simultaneously, as split-brain corrupts shared CSV/SAN volumes.',
    expected: 'All cluster nodes and witness show Up and roles balance cleanly.',
    prevent: ['Always configure a Cloud Witness or File Share Witness on even-numbered clusters'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['event 1135', 'failover cluster quarantine', 'udp 3343', 'quorum lost']
  },
  {
    id: 'SRV-006',
    title: 'Windows Server Stuck at Getting Windows Ready / Installing Updates for Hours',
    category: 'Windows Server',
    desc: 'Maintenance window is ending and Windows Server has been stuck at Getting Windows ready - Dont turn off your computer for >90 minutes.',
    symptoms: ['Spinning dots stuck for 1-3 hours during reboot', 'Ping may still respond while console is locked'],
    causes: ['TrustedInstaller waiting on hung third-party service shutdown or massive Servicing Stack delta'],
    steps: ['Before hard-powering off, test remote PowerShell/SCM connectivity! Check if TiWorker.exe or TrustedInstaller.exe is actively consuming CPU/Disk I/O.', 'If CPU/Disk is actively ticking, WAIT—killing active servicing corrupts CBS.', 'If TrustedInstaller is completely idle and a hung service (e.g., backup agent) is stuck in StopPending, terminate ONLY the stuck StopPending PID remotely so reboot completes cleanly!'],
    cmds: [
      ['PowerShell', 'Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service | Where Status -in "StopPending","StartPending" }', 'Find hung service blocking shutdown'],
      ['PowerShell', 'Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Process TiWorker, TrustedInstaller -ErrorAction SilentlyContinue }', 'Verify whether servicing is still active']
    ],
    warn: 'Never hard-reset a VM while TiWorker.exe has active disk writes unless >3 hours completely frozen with a pre-patch snapshot available.',
    expected: 'Terminating the hung StopPending service allows the server to reboot cleanly in seconds.',
    prevent: ['Stop heavy DB/backup services gracefully in pre-reboot maintenance scripts'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['getting windows ready stuck', 'stoppending service', 'tiworker', 'server stuck rebooting']
  },
  {
    id: 'SRV-007',
    title: 'DFS Replication Backlog Growing into Thousands of Unsynced Files',
    category: 'Windows Server',
    desc: 'Files saved by HQ users on FS01 are taking hours or days to appear on branch file server FS02.',
    symptoms: ['Missing or outdated files between DFS namespace targets', 'Get-DfsrBacklog shows 10,000+ queued files'],
    causes: ['DFSR Staging folder quota (default 4 GB) smaller than top 32 largest files', 'Antivirus locking DFSR Jet DB or Staging folder', 'WAN bandwidth throttling schedule'],
    steps: ['Measure exact backlog count between Sending and Receiving members.', 'Calculate size of largest 32 files in the replicated folder and increase Staging Quota accordingly.', 'Verify antivirus excludes DFSR Private/Staging folders per Microsoft guidance.'],
    cmds: [
      ['PowerShell', 'Get-DfsrBacklog -GroupName "CorpShares" -FolderName "Engineering" -SourceComputerName "FS01" -DestinationComputerName "FS02" -Verbose', 'Measure exact replication backlog count']
    ],
    expected: 'Staging bottleneck clears and DFSR drains backlog to zero.',
    prevent: ['Size DFSR Staging Quota to at least the sum of the 32 largest files in the share'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['dfsr backlog', 'get-dfsrbacklog', 'staging quota', 'dfs not syncing']
  },
  {
    id: 'SRV-008',
    title: 'Non-Paged Pool Memory Leak Exhausting 100% Server RAM',
    category: 'Windows Server',
    desc: 'Server shows 98% RAM used in Task Manager, yet summing all user processes only accounts for 20% of RAM.',
    symptoms: ['RAM utilization climbs steadily until server hangs with Event ID 2019 (Srv/Nonpaged pool empty)', 'Task Manager Memory > Non-paged pool is 20+ GB'],
    causes: ['Kernel-mode NIC, storage, or EDR driver leaking Non-Paged Pool tags'],
    steps: ['Check Non-paged pool size in Task Manager > Performance > Memory.', 'Identify top kernel pool tags using Get-CimInstance or Windows Driver Kit poolmon.exe.', 'Match the 4-letter Pool Tag to the offending .sys driver in C:\\Windows\\System32\\drivers and update that vendor driver.'],
    cmds: [
      ['PowerShell', 'Get-CimInstance Win32_OperatingSystem | Select TotalVisibleMemorySize, FreePhysicalMemory', 'Check available physical memory'],
      ['CMD', 'findstr /m /l "LeakTag" C:\\Windows\\System32\\drivers\\*.sys', 'Map 4-char pool tag to exact driver binary']
    ],
    expected: 'Updated kernel driver stops leaking non-paged pool and server uptime stabilizes.',
    prevent: ['Keep Broadcom/Intel NIC, storage HBA, and EDR sensor versions current'],
    diff: 'Advanced',
    time: '25-35 minutes',
    tags: ['non-paged pool leak', 'event 2019', 'poolmon', 'high ram no process']
  },
  {
    id: 'SRV-009',
    title: 'Enterprise PKI Subordinate CA Certificate Services Failing to Start (CRL Expired)',
    category: 'Windows Server',
    desc: 'Active Directory Certificate Services (CertSvc) refuses to start or issue LDAPS/WiFi certificates with Revocation Server Offline (0x80092013).',
    symptoms: ['CertSvc fails to start or auto-enrollment fails with 0x80092013', 'pkiview.msc shows red X on DeltaCRL or Base CRL'],
    causes: ['Offline Root CA CRL expired in HTTP/LDAP CDP location', 'IIS hosting http://pki.corp.local/CertEnroll stopped'],
    steps: ['Launch pkiview.msc (Enterprise PKI) to immediately spot whichAIA or CDP URL or CRL is expired/unreachable.', 'If Offline Root CA CRL expired, power on Offline Root CA, run certutil -crl, copy fresh .crl to HTTP CDP server and publish to AD with certutil -dspublish -f <file>.crl.', 'Verify IIS CertEnroll virtual directory allows anonymous HTTP (port 80) read and double-escaping (`allowDoubleEscaping="true"` for Delta CRL `+` signs!).'],
    cmds: [
      ['CMD', 'certutil -crl', 'Publish fresh CRL on CA'],
      ['CMD', 'certutil -urlcache * delete', 'Flush cached stale CRLs on client/server']
    ],
    expected: 'pkiview.msc shows OK across all AIA/CDP endpoints and auto-enrollment succeeds.',
    prevent: ['Set calendar reminders 30 days prior to Offline Root CA CRL expiration (typically 6-12 month validity)'],
    diff: 'Advanced',
    time: '30 minutes',
    tags: ['0x80092013', 'pkiview.msc', 'certsvc', 'crl expired', 'allowdoubleescaping']
  },
  {
    id: 'SRV-010',
    title: 'WSUS Server IIS AppPool (WsusPool) Crashing Every 5 Minutes',
    category: 'Windows Server',
    desc: 'WSUS console throws Reset Server Node error whenever clients scan for updates.',
    symptoms: ['WSUS MMC console disconnects with Reset Server Node', 'WsusPool hits Private Memory Limit (default 1.8 GB) and recycles constantly'],
    causes: ['Default WsusPool Private Memory Limit (1,843,200 KB) is far too low for modern cumulative update catalogs', 'Unindexed SUSDB SQL database'],
    steps: ['In IIS Manager > Application Pools > WsusPool > Advanced Settings, increase Private Memory Limit from 1843200 to 0 (Unlimited) or 8388608 (8 GB) and increase Queue Length to 25000.', 'Decline superseded/Itanium/ARM64 updates and run WSUS Server Cleanup Wizard.', 'Re-index SUSDB database.'],
    cmds: [
      ['PowerShell', 'Import-Module WebAdministration; Set-ItemProperty IIS:\\AppPools\\WsusPool -Name Recycling.periodicRestart.privateMemory -Value 0; Restart-WebAppPool WsusPool', 'Remove 1.8GB WsusPool memory cap']
    ],
    expected: 'WSUS console responds briskly and 500+ endpoints scan without HTTP 503 crashes.',
    prevent: ['Automate monthly declined/superseded update cleanup and SUSDB index maintenance'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['wsus reset server node', 'wsuspool crashing', 'susdb', 'private memory limit']
  },
  {
    id: 'SRV-011',
    title: 'Windows Server Evaluation Edition Expiring or Shutting Down Hourly',
    category: 'Windows Server',
    desc: 'Server deployed from 180-day Evaluation ISO begins shutting itself down every 60 minutes (WLMS.exe).',
    symptoms: ['Server shuts down cleanly every 1 hour on the dot', 'Desktop watermark shows Windows License is expired'],
    causes: ['Server installed using Evaluation media and never converted to Retail/Volume Standard or Datacenter edition via DISM'],
    steps: ['Check current edition and upgradable target editions with DISM.', 'Convert in-place from ServerStandardEval to ServerStandard (or ServerDatacenter) using DISM /Set-Edition and a valid product key (or GVLK key if using KMS/ADBA) and reboot once.'],
    cmds: [
      ['CMD', 'DISM /online /Get-CurrentEdition', 'Check if running Eval edition'],
      ['CMD', 'DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula', 'Convert Eval to full licensed edition']
    ],
    warn: 'Note: Active Directory Domain Controllers CANNOT run DISM /Set-Edition while promoted—check edition BEFORE promoting a DC!',
    expected: 'Evaluation expiry clears, server activates permanently, and hourly shutdowns stop.',
    prevent: ['Build VM templates strictly from Volume Licensed media rather than Evaluation ISOs'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['windows server shutting down every hour', 'wlms', 'set-edition', 'eval to standard']
  },
  {
    id: 'SRV-012',
    title: 'NPS / RADIUS Rejecting Corporate 802.1X WiFi After Certificate Renewal',
    category: 'Windows Server',
    desc: 'All corporate laptops suddenly fail 802.1X PEAP/EAP-TLS WiFi authentication the morning after NPS server certificate renewed.',
    symptoms: ['Corporate SSID prompts Unable to connect across entire office', 'NPS Security log shows Event ID 6273 Reason Code 22 or 265'],
    causes: ['NPS Network Policy is still bound to the old expired certificate thumbprint instead of the newly auto-enrolled certificate'],
    steps: ['Open Network Policy Server (nps.msc) > Policies > Network Policies.', 'Open the 802.1X Wireless Policy > Constraints > Authentication Methods > click Edit on Microsoft: Protected EAP (PEAP) or Smart Card/Certificate.', 'Select the newly renewed, valid server certificate from the dropdown, click OK, and restart IAS (Network Policy Server) service.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Security"; ID=6273} -MaxEvents 10 | Select TimeCreated, Message', 'Inspect NPS rejection reason code'],
      ['PowerShell', 'Restart-Service IAS -Force', 'Restart Network Policy Server']
    ],
    expected: 'NPS presents the new TLS server certificate and all domain laptops reconnect automatically.',
    prevent: ['Document NPS certificate binding refresh in annual PKI renewal runbooks'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['nps 6273', '802.1x wifi broken', 'peap certificate', 'radius failed']
  },
  {
    id: 'SRV-013',
    title: 'Windows Admin Center / WinRM Remote Management Failing (WS-Management Error)',
    category: 'Windows Server',
    desc: 'Server Manager and Enter-PSSession fail to connect to member server with WinRM cannot complete the operation.',
    symptoms: ['Enter-PSSession SRV02 fails with WSMan error', 'Server Manager shows WinRM negotiation failed'],
    causes: ['WinRM service stopped or listener missing', 'TCP port 5985 (HTTP Kerberos-encrypted) blocked', 'Connecting by raw IP instead of Kerberos FQDN'],
    steps: ['Always connect using the AD FQDN (SRV02.corp.local), not raw IP address, so Kerberos authenticates WinRM!', 'On target server, run winrm quickconfig to ensure WinRM service, listener, and domain firewall exception are enabled.', 'Test WinRM handshake from admin workstation with Test-WSMan.'],
    cmds: [
      ['PowerShell', 'Enable-PSRemoting -Force', 'Configure WinRM listener and firewall rule on target'],
      ['PowerShell', 'Test-WSMan -ComputerName SRV02.corp.local -Authentication Default', 'Verify authenticated WinRM connectivity']
    ],
    expected: 'Remote PowerShell, Server Manager, and Windows Admin Center connect seamlessly.',
    prevent: ['Include Enable-PSRemoting in golden Windows Server VM templates'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['winrm error', 'enter-pssession failed', 'test-wsman', 'port 5985']
  }
];

// Fix minor typo in PRT-005 category cast if any
SEEDS_PART_2.forEach((s) => {
  if ((s.category as string) === 'Printer & Exchange') {
    s.category = 'Printer & Scanner';
  }
});

export const ISSUES_PART_2 = expandIssues(SEEDS_PART_2);
