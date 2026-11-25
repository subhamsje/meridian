import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1")
    : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1");

/**
 * Safely parses JSON from a Response object without ever throwing a SyntaxError
 * when receiving plaintext error bodies like "Internal Server Error" or 502/500 pages.
 */
export async function safeJson<T = any>(res: Response | null | undefined, fallback: T = null as any): Promise<T> {
  if (!res || !res.ok) return fallback;
  try {
    const text = await res.text();
    if (!text || !text.trim()) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

