import { serve } from "inngest/next";
import { handleClerkUserCreated } from "@/inngest/functions/userCreated";
import { inngest } from "@/inngest/client";
import { handleClerkUserDeleted } from "@/inngest/functions/userDeleted";
import { handleClerkUserUpdated } from "@/inngest/functions/userUpdated";
import { sendNewConnectionRequestReminder } from "@/inngest/functions/connectionRequest";
import { deleteStory } from "@/inngest/functions/deleteStory";
import { sendNotificationOfUnseenMessages } from "@/inngest/functions/unseenMessagesNotification";

console.log("SERVER ENV - URL:", process.env.INNGEST_URL);
console.log("SERVER ENV - KEY:", process.env.INNGEST_EVENT_KEY);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleClerkUserCreated,
    handleClerkUserDeleted,
    handleClerkUserUpdated,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
  ],
});
