export interface DeveloperBrandingConfig {
  readonly name: string;
  readonly brandName: string;
  readonly fullCreditName: string;
  readonly role: string;
  readonly whatsappNumber: string;
  readonly whatsappMessage: string;
  readonly whatsappUrl: string;
  readonly creditHeading: string;
  readonly ctaLabel: string;
  readonly finalSiteTitle: string;
  readonly finalDeveloperCredit: string;
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

const WHATSAPP_NUMBER = '916387661594';
const WHATSAPP_MESSAGE =
  'Hello Vicky, I visited your IT SUPPORT website and would like to connect with you.';

export const DEVELOPER_BRANDING: DeveloperBrandingConfig = Object.freeze({
  name: 'VICKY',
  brandName: 'VICTORIX',
  fullCreditName: 'VICKY VICTORIX',
  role: 'Website Designer & Developer',
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappMessage: WHATSAPP_MESSAGE,
  whatsappUrl: buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE),
  creditHeading: 'Website Designed & Developed By',
  ctaLabel: 'Contact Developer on WhatsApp',
  finalSiteTitle: 'IT SUPPORT – Your Complete IT Troubleshooting Guide.',
  finalDeveloperCredit: 'Designed & Developed By VICKY (VICTORIX).',
});
