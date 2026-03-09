import { Order } from './OrderStatusUtils';

export function formatAddress(order: Order): string {
  const addrObj = (order as any).address && typeof (order as any).address === 'object' ? (order as any).address : null;
  const parts = [
    order.address_line1 || addrObj?.address_line1 || addrObj?.address || (typeof order.address === 'string' ? order.address : ''),
    order.city || addrObj?.city,
    order.state || addrObj?.state,
    order.country || addrObj?.country,
  ].filter(Boolean);
  const pin = order.pinCode || addrObj?.pinCode || addrObj?.postal_code;
  const joined = parts.join(', ').trim();
  return `${joined}${pin ? ` ${pin}` : ''}` || '—';
}
