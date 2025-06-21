import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";

// Validate webhook signature
async function validateRequest(request: Request): Promise<WebhookEvent | null> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables");
  }

  // Get the headers
  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return null;
  }

  // Get the body
  const body = await request.text();

  // Create a Svix instance with your secret.
  const { Webhook } = await import("svix");
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return null;
  }

  return evt;
}

// Define the webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occurred", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      await ctx.runMutation(internal.users.updateOrCreateUser, {
        clerkUser: event.data,
      });
      break;
    }
    case "user.deleted": {
      const id = event.data.id!;
      await ctx.runMutation(internal.users.deleteUser, { clerkId: id });
      break;
    }
    default: {
      // Ignore other webhook events
    }
  }

  return new Response(null, { status: 200 });
});

// Define the HTTP router
const http = httpRouter();

// Define the webhook route
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
