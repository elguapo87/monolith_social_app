import connectionModel from "@/models/connectionModel";
import { inngest } from "../client";
import sendEmail from "@/config/nodeMailer";

interface IUser {
    _id: string;
    full_name: string;
    user_name: string;
    email: string;
}

interface IConnection {
    _id: string;
    from_user_id: string | IUser;
    to_user_id: string | IUser;
    status: "pending" | "accepted";
}

function connectionEmailTemplate(connection: IConnection & { from_user_id: IUser; to_user_id: IUser }) {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} -
            @${connection.from_user_id.user_name}
        </p>
        <p>
          Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a>
          to accept or reject the request.
        </p>
        <br/>
        <p>Thanks,<br/> Monolith, Stay Connected</p>
    </div>
  `;
}

export const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: "send-new-connection-request-reminder" },
    { event: "app/connection-request" },
    async ({ event, step }) => {
        const { connectionId } = event.data;

        // 1. Send initial email immediately
        await step.run("send-connection-request-email", async () => {
            const connection = await connectionModel
                .findById(connectionId)
                .populate("from_user_id to_user_id");

            if (!connection) return;

            await sendEmail({
                to: connection.to_user_id.email,
                subject: "New Connection Request",
                body: connectionEmailTemplate(connection),
            });
        });

        // 2. Wait 24 hours
        await step.sleep("wait-for-24-hours", "24h");

        // 3. Send reminder if still not accepted
        await step.run("send-connection-request-reminder", async () => {
            const connection = await connectionModel
                .findById(connectionId)
                .populate("from_user_id to_user_id");

            if (!connection) return { message: "Connection was deleted." };
            if (connection.status === "accepted")
                return { message: "Already accepted." };

            await sendEmail({
                to: connection.to_user_id.email,
                subject: "New Connection Request",
                body: connectionEmailTemplate(connection),
            });

            return { message: "Reminder sent." };
        });
    }
);
