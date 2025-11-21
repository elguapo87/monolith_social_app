import messageModel from "@/models/messageModel";
import { inngest } from "../client";
import userModel from "@/models/userModel";
import sendEmail from "@/config/nodeMailer";

export const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },

  {
    cron: "0 9 * * *",     // every day at 09:00
    tz: "Europe/Belgrade"  // timezone
  },

  async () => {
    const messages = await messageModel
      .find({ seen: false })
      .populate("to_user_id");

    const unseenCount: Record<string, number> = {};

    messages.forEach((message) => {
      const userId = message.to_user_id._id.toString();
      unseenCount[userId] = (unseenCount[userId] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await userModel.findById(userId);
      if (!user) continue;

      const subject = `You have ${unseenCount[userId]} unseen messages`;

      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${user.full_name},</h2>
          <p>You have ${unseenCount[userId]} unseen messages.</p>
          <p>
            Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them.
          </p>
          <br/>
          <p>Thanks,<br/>Monolith - Stay Connected</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject,
        body
      });
    }

    return { message: "Notification sent." };
  }
);

