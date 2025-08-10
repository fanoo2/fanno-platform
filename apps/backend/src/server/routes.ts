import type { Express, Request, Response } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { AccessToken } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';

export function registerRoutes(app: Express) {
  // LiveKit token
  app.post('/api/livekit/token', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const url = process.env.LIVEKIT_URL;
      if (!apiKey || !apiSecret || !url) {
        return res.status(500).json({ error: 'LIVEKIT_URL/API KEY/SECRET missing' });
      }
      const { identity, roomName } = (req.body ?? {}) as { identity?: string; roomName?: string };
      const userIdentity = identity ?? `guest-${randomUUID()}`;

      const at = new AccessToken(apiKey, apiSecret, { identity: userIdentity });
      at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true });
      const token = at.toJwt();
      return res.json({ token, url, identity: userIdentity, roomName: roomName ?? null });
    } catch (err: unknown) {
      console.error('livekit token error', err);
      return res.status(500).json({ error: 'token_failed' });
    }
  });

  // Stripe checkout
  app.post('/payments/create-session', async (req: Request, res: Response) => {
    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY missing' });
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price_data: { currency: 'usd', unit_amount: 500, product_data: { name: 'Coins' } }, quantity: 1 }],
        success_url: `${process.env.PUBLIC_WEB_URL ?? 'http://localhost:5173'}/checkout?success=1`,
        cancel_url: `${process.env.PUBLIC_WEB_URL ?? 'http://localhost:5173'}/checkout?canceled=1`
      });
      return res.json({ id: session.id, url: session.url });
    } catch (err: unknown) {
      console.error('create-session error', err);
      return res.status(500).json({ error: 'stripe_failed' });
    }
  });

  // Stripe webhook (raw body)
  app.post('/payments/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).send('No signature');
    // Verify & handle events here if you add STRIPE_WEBHOOK_SECRET.
    return res.json({ ok: true });
  });
}