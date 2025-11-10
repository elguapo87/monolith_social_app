import { serve } from "inngest/next";
import { handleClerkUserCreated } from "@/inngest/functions/userCreated";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleClerkUserCreated],
});
