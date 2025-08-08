export function generateTrackingId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `NIPOST${timestamp.slice(-6)}${random}`.toUpperCase();
}

export function validateTrackingId(trackingId: string): boolean {
  // Basic validation: starts with NIPOST, followed by alphanumeric characters
  return /^NIPOST[A-Z0-9]{12,}$/.test(trackingId);
}

export function formatTrackingId(trackingId: string): string {
  return trackingId.toUpperCase();
}