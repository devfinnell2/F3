// ─────────────────────────────────────────────
//  F3 — Groq AI Client
//  Groq is OpenAI-compatible — same SDK,
//  different base URL and model names
// ─────────────────────────────────────────────

import OpenAI from 'openai';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not defined in .env.local');
}

const groq = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// ── Available Groq models ──────────────────────
// llama-3.3-70b-versatile  — best quality, use for AI Coach
// llama-3.1-8b-instant     — fastest, use for macro parsing
// mixtral-8x7b-32768       — large context, use for RAG

export const GROQ_MODELS = {
  coach:  'llama-3.3-70b-versatile',
  fast:   'llama-3.1-8b-instant',
  rag:    'llama-3.3-70b-versatile',
} as const;

export default groq;