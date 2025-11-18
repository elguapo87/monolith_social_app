import { serve } from "inngest/next";
import { handleClerkUserCreated } from "@/inngest/functions/userCreated";
import { inngest } from "@/inngest/client";
import { handleClerkUserDeleted } from "@/inngest/functions/userDeleted";
import { handleClerkUserUpdated } from "@/inngest/functions/userUpdated";
import { sendNewConnectionRequestReminder } from "@/inngest/functions/connectionRequest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleClerkUserCreated,
    handleClerkUserDeleted,
    handleClerkUserUpdated,
    sendNewConnectionRequestReminder
  ],
});
