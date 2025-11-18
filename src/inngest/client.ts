import { Inngest } from "inngest";
import type { AppEvents } from "./events";

export const inngest = new Inngest({
  id: "monolith-social",
  name: "Monolith Social App",
});

// typed helper for sending events that uses the AppEvents map
export async function sendAppEvent<K extends keyof AppEvents>(
  name: K,
  payload: AppEvents[K]
) {
  // We cast here to `any` for the runtime call because
  // the Inngest lib's typing for send may not accept our generic shape,
  // but the wrapper ensures callers are strongly typed.
  return inngest.send(name as any, payload as any);
}
