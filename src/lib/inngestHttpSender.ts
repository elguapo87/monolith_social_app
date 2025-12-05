import type { AppEvents } from "@/inngest/events";

export async function sendInngestEvent<K extends keyof AppEvents>(
  name: K,
  payload: AppEvents[K]
) {
  const base = process.env.INNGEST_URL || "http://localhost:8288";
  const key = process.env.INNGEST_EVENT_KEY || "dev";

  const url = `${base.replace(/\/$/, "")}/e/${key}`;

  const body = JSON.stringify({
    name,
    data: payload.data,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Inngest HTTP error ${res.status}: ${text}`);
  }

  return res.json();
}
