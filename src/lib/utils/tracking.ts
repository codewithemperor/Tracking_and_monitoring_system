export function generateTrackingId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `NIPOST${timestamp.slice(-6)}${random}`.toUpperCase();
}

export function validateTrackingId(trackingId: string): boolean {
  // Validate different tracking ID formats:
  // 1. NIPOST format: NIPOST followed by alphanumeric characters (at least 12 chars total)
  // 2. NIP format: NIP followed by numbers and letters (e.g., NIP2024001, NPME33FQFQ7ZVO6)
  if (!trackingId || trackingId.length < 8) {
    return false;
  }
  
  // Check for NIPOST format (NIPOST + at least 12 alphanumeric chars)
  if (trackingId.startsWith('NIPOST') && /^NIPOST[A-Z0-9]{12,}$/.test(trackingId)) {
    return true;
  }
  
  // Check for NIP format (NIP + alphanumeric chars, at least 8 chars total)
  if (trackingId.startsWith('NIP') && /^[A-Z0-9]{8,}$/.test(trackingId)) {
    return true;
  }
  
  // Check for NPM format (NPM + alphanumeric chars, at least 8 chars total)
  if (trackingId.startsWith('NPM') && /^[A-Z0-9]{8,}$/.test(trackingId)) {
    return true;
  }
  
  return false;
}

export function formatTrackingId(trackingId: string): string {
  return trackingId.toUpperCase();
}