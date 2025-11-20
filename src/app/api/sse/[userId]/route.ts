import connections from "@/sse/connections";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Store the connection
    connections[userId] = writer;

    // Send initial handshake
    await writer.write(`event: connected\ndata: "SSE connected"\n\n`);

    // When the client disconnects, remove writer
    req.signal.addEventListener("abort", () => {
        delete connections[userId];
        writer.close();
    });

    return new Response(stream.readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        }
    });
}
