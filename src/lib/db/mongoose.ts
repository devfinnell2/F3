// ─────────────────────────────────────────────
//  F3 — MongoDB Connection
//  Singleton pattern — reuses connection across
//  Next.js hot reloads in development
// ─────────────────────────────────────────────

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not defined. Add it to your .env.local file.'
  );
}

// ── Connection cache ───────────────────────────
// Next.js hot reloads create new module instances
// in dev. This caches the connection on the global
// object so we don't open a new connection every time.

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

// ── Connect ────────────────────────────────────

export async function connectDB(): Promise<typeof mongoose> {
  // Already connected — return cached connection
  if (cache.conn) {
    return cache.conn;
  }

  // Connection in progress — wait for it
  if (!cache.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cache.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Reset promise so next call retries
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

// ── Disconnect (used in tests) ─────────────────

export async function disconnectDB(): Promise<void> {
  if (cache.conn) {
    await mongoose.disconnect();
    cache.conn = null;
    cache.promise = null;
  }
}