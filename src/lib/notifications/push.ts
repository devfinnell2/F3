// ─────────────────────────────────────────────
//  F3 — Push Notification Sender
// ─────────────────────────────────────────────
import webpush                from 'web-push';
import { connectDB }          from '@/lib/db/mongoose';
import PushSubscriptionModel  from '@/lib/db/models/PushSubscription';
import NotificationModel      from '@/lib/db/models/Notification';
import type { NotificationType } from '@/lib/db/models/Notification';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body:  string;
  icon?: string;
  url?:  string;
}

// ── Send push + save in-app notification ──────
export async function sendNotification(
  userId:  string,
  type:    NotificationType,
  payload: PushPayload,
): Promise<void> {
  await connectDB();

  // Save in-app notification
  await NotificationModel.create({
    userId,
    type,
    title: payload.title,
    body:  payload.body,
    read:  false,
  });

  // Find all push subscriptions for this user (multi-device)
  const subscriptions = await PushSubscriptionModel.find({ userId }).lean();
  if (!subscriptions.length) return;

  const pushData = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon ?? '/icon-192.png',
    url:   payload.url  ?? '/dashboard/client',
  });

  // Fire all, remove stale subscriptions silently
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          pushData
        );
      } catch (err: any) {
        // 410 Gone = subscription expired, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscriptionModel.deleteOne({ endpoint: sub.endpoint });
        }
      }
    })
  );
}