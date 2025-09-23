/**
 * QR Content Type Detection Utility
 * Detects the type of content in QR codes for filtering purposes
 */

export type QRContentType = 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard' | 'sms' | 'location' | 'event';

/**
 * Detects the content type of a QR code text
 */
export function detectQRContentType(text: string): QRContentType {
  if (!text || typeof text !== 'string') {
    return 'text';
  }

  const trimmedText = text.trim();

  // WiFi QR Code
  if (trimmedText.startsWith('WIFI:')) {
    return 'wifi';
  }

  // vCard (Contact)
  if (trimmedText.startsWith('BEGIN:VCARD') || trimmedText.includes('VCARD')) {
    return 'vcard';
  }

  // Event (Calendar)
  if (trimmedText.startsWith('BEGIN:VEVENT') || trimmedText.includes('VEVENT')) {
    return 'event';
  }

  // SMS
  if (trimmedText.startsWith('sms:') || trimmedText.startsWith('SMS:')) {
    return 'sms';
  }

  // Email
  if (trimmedText.startsWith('mailto:') || isEmail(trimmedText)) {
    return 'email';
  }

  // Phone number
  if (trimmedText.startsWith('tel:') || trimmedText.startsWith('TEL:') || isPhoneNumber(trimmedText)) {
    return 'phone';
  }

  // URL
  if (isURL(trimmedText)) {
    return 'url';
  }

  // Location (Geo coordinates)
  if (trimmedText.startsWith('geo:') || isGeoLocation(trimmedText)) {
    return 'location';
  }

  // Default to text
  return 'text';
}

/**
 * Checks if text is a valid URL
 */
function isURL(text: string): boolean {
  try {
    const url = new URL(text);
    return ['http:', 'https:', 'ftp:', 'ftps:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Checks if text is a valid email
 */
function isEmail(text: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(text);
}

/**
 * Checks if text is a phone number
 */
function isPhoneNumber(text: string): boolean {
  // Remove common phone number characters
  const cleaned = text.replace(/[\s\-()+]/g, '');
  
  // Check if it's mostly digits and reasonable length
  const digitRegex = /^\d{7,15}$/;
  return digitRegex.test(cleaned);
}

/**
 * Checks if text is a geo location
 */
function isGeoLocation(text: string): boolean {
  // Check for geo: format
  if (text.startsWith('geo:')) {
    return true;
  }

  // Check for coordinate pattern (lat,lng)
  const coordRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  return coordRegex.test(text);
}

/**
 * Gets a human-readable description of the content type
 */
export function getContentTypeDescription(type: QRContentType): string {
  const descriptions: Record<QRContentType, string> = {
    text: 'Plain Text',
    url: 'Website URL',
    email: 'Email Address',
    phone: 'Phone Number',
    wifi: 'WiFi Network',
    vcard: 'Contact Card',
    sms: 'SMS Message',
    location: 'Location/GPS',
    event: 'Calendar Event',
  };

  return descriptions[type] || 'Unknown';
}

/**
 * Gets an icon name for the content type (for Lucide React icons)
 */
export function getContentTypeIcon(type: QRContentType): string {
  const icons: Record<QRContentType, string> = {
    text: 'FileText',
    url: 'Globe',
    email: 'Mail',
    phone: 'Phone',
    wifi: 'Wifi',
    vcard: 'User',
    sms: 'MessageSquare',
    location: 'MapPin',
    event: 'Calendar',
  };

  return icons[type] || 'FileText';
}

/**
 * Filters QR history based on content types
 */
export function filterByContentTypes(
  qrHistory: Array<{ textContent: string }>,
  contentTypes: string[]
): Array<{ textContent: string }> {
  if (contentTypes.length === 0) {
    return qrHistory;
  }

  return qrHistory.filter(qr => {
    const detectedType = detectQRContentType(qr.textContent);
    return contentTypes.includes(detectedType);
  });
}
