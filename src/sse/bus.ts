// Global map
const connections: Record<string, ReadableStreamDefaultController[]> = {};

export function registerConnection(userId: string, controller: ReadableStreamDefaultController) {
  if (!connections[userId]) connections[userId] = [];
  connections[userId].push(controller);
}

export function removeConnection(userId: string, controller: ReadableStreamDefaultController) {
  if (!connections[userId]) return;
  connections[userId] = connections[userId].filter(c => c !== controller);
}

export function sendSSEvent(userId: string, event: string, payload: any) {
  const list = connections[userId];
  if (!list || list.length === 0) {
    console.log("No SSE connections for:", userId);
    return;
  }

  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  const encoded = new TextEncoder().encode(data);

  for (const controller of list) {
    controller.enqueue(encoded);
  }
}

export default connections;
