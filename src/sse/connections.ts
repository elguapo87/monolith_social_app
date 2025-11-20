// Store active SSE connections globally
type SSEConnetions = {
    [userId: string]: WritableStreamDefaultWriter;
};

const connections: SSEConnetions = {};

export default connections;