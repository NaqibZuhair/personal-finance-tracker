export function normalizeWaPhone(phone?: string | null): string | null {
  if (!phone) return null;
  
  // Remove spaces, dashes, parentheses, and trailing @s.whatsapp.net
  let cleaned = phone.toString().trim().replace(/@s\.whatsapp\.net$/i, '').replace(/[^0-9]/g, '');

  if (!cleaned) return null;

  // If starts with '0', replace leading '0' with '62'
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // If doesn't start with 62 but starts with 8 (e.g. 812345...), prepend 62
  if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}
