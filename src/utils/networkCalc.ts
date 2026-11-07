export interface SubnetCalculationResult {
  valid: boolean;
  error?: string;
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalAddresses: number;
  usableHosts: number;
  binaryIp: string;
  binaryMask: string;
  ipClass: 'Class A' | 'Class B' | 'Class C' | 'Class D (Multicast)' | 'Class E (Experimental)';
  scopeType: string;
  isPrivate: boolean;
  cidrNotation: string;
}

export function isValidIpv4(ip: string): boolean {
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
  }
  return true;
}

export function ipToUint32(ip: string): number {
  const parts = ip.trim().split('.').map(Number);
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
}

export function uint32ToIp(int: number): string {
  const unsigned = int >>> 0;
  return [
    (unsigned >>> 24) & 255,
    (unsigned >>> 16) & 255,
    (unsigned >>> 8) & 255,
    unsigned & 255,
  ].join('.');
}

export function uint32ToBinaryOctets(int: number): string {
  const unsigned = int >>> 0;
  return [
    ((unsigned >>> 24) & 255).toString(2).padStart(8, '0'),
    ((unsigned >>> 16) & 255).toString(2).padStart(8, '0'),
    ((unsigned >>> 8) & 255).toString(2).padStart(8, '0'),
    (unsigned & 255).toString(2).padStart(8, '0'),
  ].join('.');
}

export function cidrToMaskUint32(cidr: number): number {
  if (cidr <= 0) return 0;
  if (cidr >= 32) return 0xffffffff >>> 0;
  return ((0xffffffff << (32 - cidr)) >>> 0);
}

export function cidrToSubnetMask(cidr: number): string {
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    throw new Error('CIDR prefix must be an integer between 0 and 32.');
  }
  return uint32ToIp(cidrToMaskUint32(cidr));
}

export function subnetMaskToCidr(mask: string): number | null {
  if (!isValidIpv4(mask)) return null;
  const maskInt = ipToUint32(mask);
  if (maskInt === 0) return 0;
  const binary = maskInt.toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(binary)) return null;
  return binary.indexOf('0') === -1 ? 32 : binary.indexOf('0');
}

export function classifyIpv4(ipInt: number): {
  ipClass: SubnetCalculationResult['ipClass'];
  scopeType: string;
  isPrivate: boolean;
} {
  const unsigned = ipInt >>> 0;
  const first = (unsigned >>> 24) & 255;
  const second = (unsigned >>> 16) & 255;
  const third = (unsigned >>> 8) & 255;

  let ipClass: SubnetCalculationResult['ipClass'] = 'Class A';
  if (first >= 128 && first <= 191) ipClass = 'Class B';
  else if (first >= 192 && first <= 223) ipClass = 'Class C';
  else if (first >= 224 && first <= 239) ipClass = 'Class D (Multicast)';
  else if (first >= 240) ipClass = 'Class E (Experimental)';

  if (unsigned === 0) {
    return { ipClass, scopeType: 'Unspecified / Default Route (0.0.0.0)', isPrivate: true };
  }
  if (unsigned === 0xffffffff) {
    return { ipClass, scopeType: 'Limited Broadcast (255.255.255.255)', isPrivate: true };
  }
  if (first === 10) {
    return { ipClass, scopeType: 'RFC 1918 Private Network (10.0.0.0/8)', isPrivate: true };
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return { ipClass, scopeType: 'RFC 1918 Private Network (172.16.0.0/12)', isPrivate: true };
  }
  if (first === 192 && second === 168) {
    return { ipClass, scopeType: 'RFC 1918 Private Network (192.168.0.0/16)', isPrivate: true };
  }
  if (first === 100 && second >= 64 && second <= 127) {
    return { ipClass, scopeType: 'RFC 6598 Carrier-Grade NAT / CGNAT (100.64.0.0/10)', isPrivate: true };
  }
  if (first === 127) {
    return { ipClass, scopeType: 'Loopback Host Diagnostics (127.0.0.0/8)', isPrivate: true };
  }
  if (first === 169 && second === 254) {
    return { ipClass, scopeType: 'RFC 3927 Link-Local / APIPA (169.254.0.0/16 — Check DHCP!)', isPrivate: true };
  }
  if (
    (first === 192 && second === 0 && third === 2) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113)
  ) {
    return { ipClass, scopeType: 'RFC 5737 Documentation / Lab Range (TEST-NET)', isPrivate: true };
  }
  if (first >= 224 && first <= 239) {
    return { ipClass, scopeType: 'IPv4 Multicast Space (224.0.0.0/4)', isPrivate: false };
  }
  if (first >= 240) {
    return { ipClass, scopeType: 'Reserved Experimental Space (240.0.0.0/4)', isPrivate: true };
  }

  return { ipClass, scopeType: 'Public Routable Internet IPv4 Address', isPrivate: false };
}

export function calculateSubnet(ipInput: string, cidrInput: number): SubnetCalculationResult {
  const cleanIp = ipInput.trim();
  if (!isValidIpv4(cleanIp)) {
    return {
      valid: false,
      error: 'Enter a valid IPv4 address with four octets between 0 and 255 (e.g., 192.168.10.45).',
      ipAddress: cleanIp,
      cidr: cidrInput,
      subnetMask: '',
      wildcardMask: '',
      networkAddress: '',
      broadcastAddress: '',
      firstUsableHost: '',
      lastUsableHost: '',
      totalAddresses: 0,
      usableHosts: 0,
      binaryIp: '',
      binaryMask: '',
      ipClass: 'Class C',
      scopeType: '',
      isPrivate: false,
      cidrNotation: '',
    };
  }

  if (!Number.isInteger(cidrInput) || cidrInput < 0 || cidrInput > 32) {
    return {
      valid: false,
      error: 'CIDR prefix length must be an integer between /0 and /32.',
      ipAddress: cleanIp,
      cidr: cidrInput,
      subnetMask: '',
      wildcardMask: '',
      networkAddress: '',
      broadcastAddress: '',
      firstUsableHost: '',
      lastUsableHost: '',
      totalAddresses: 0,
      usableHosts: 0,
      binaryIp: '',
      binaryMask: '',
      ipClass: 'Class C',
      scopeType: '',
      isPrivate: false,
      cidrNotation: '',
    };
  }

  const ipInt = ipToUint32(cleanIp);
  const maskInt = cidrToMaskUint32(cidrInput);
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalAddresses = Math.pow(2, 32 - cidrInput);
  let usableHosts = 0;
  let firstHostInt = networkInt;
  let lastHostInt = broadcastInt;

  if (cidrInput === 32) {
    usableHosts = 1;
    firstHostInt = networkInt;
    lastHostInt = networkInt;
  } else if (cidrInput === 31) {
    // RFC 3021 Point-to-Point router link
    usableHosts = 2;
    firstHostInt = networkInt;
    lastHostInt = broadcastInt;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstHostInt = (networkInt + 1) >>> 0;
    lastHostInt = (broadcastInt - 1) >>> 0;
  }

  const classification = classifyIpv4(ipInt);

  return {
    valid: true,
    ipAddress: cleanIp,
    cidr: cidrInput,
    subnetMask: uint32ToIp(maskInt),
    wildcardMask: uint32ToIp(wildcardInt),
    networkAddress: uint32ToIp(networkInt),
    broadcastAddress: uint32ToIp(broadcastInt),
    firstUsableHost: uint32ToIp(firstHostInt),
    lastUsableHost: uint32ToIp(lastHostInt),
    totalAddresses,
    usableHosts,
    binaryIp: uint32ToBinaryOctets(ipInt),
    binaryMask: uint32ToBinaryOctets(maskInt),
    ipClass: classification.ipClass,
    scopeType: classification.scopeType,
    isPrivate: classification.isPrivate,
    cidrNotation: `${uint32ToIp(networkInt)}/${cidrInput}`,
  };
}

export interface CidrReferenceRow {
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  usableHosts: number;
}

export function getCommonCidrTable(): CidrReferenceRow[] {
  const prefixes = [8, 12, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
  return prefixes.map((cidr) => {
    const res = calculateSubnet('10.0.0.0', cidr);
    return {
      cidr,
      subnetMask: res.subnetMask,
      wildcardMask: res.wildcardMask,
      totalAddresses: res.totalAddresses,
      usableHosts: res.usableHosts,
    };
  });
}
