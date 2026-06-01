/**
 * Generate a unique order code like "BK-A3F7X9"
 */
export function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK-${code}`;
}

/**
 * Get human-readable status label in Arabic
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'تم الإلغاء',
  };
  return labels[status] || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ba1a1a',
  };
  return colors[status] || '#6b7280';
}
