import { serve } from "inngest/next";
import { handleClerkUserCreated } from "@/inngest/functions/userCreated";
import { inngest } from "@/inngest/client";
import { handleClerkUserDeleted } from "@/inngest/functions/userDeleted";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleClerkUserCreated, handleClerkUserDeleted],
});
