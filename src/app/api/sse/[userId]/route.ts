import { NextRequest } from "next/server";
import { registerConnection, removeConnection } from "@/sse/bus";

export async function GET(req: NextRequest, context: any) {
  const { userId } = await context.params;

  const stream = new ReadableStream({
    start(controller) {
      registerConnection(userId, controller);

      controller.enqueue(
        new TextEncoder().encode(`event: connected\ndata: "connected"\n\n`)
      );

      req.signal.onabort = () => {
        removeConnection(userId, controller);
      };
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
