export async function createCheckoutSession(apiBase: string) {
  const res = await fetch(`${apiBase}/payments/create-session`, { method: 'POST' });
  if (!res.ok) throw new Error('checkout_failed');
  return res.json();
}