import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";

// Public mutation to create user from client (fallback to webhooks)
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      username: args.username,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Internal mutation to create or update user from webhook
export const updateOrCreateUser = internalMutation({
  args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clerkUser: v.any(), // Use v.any() to handle Clerk's UserJSON type
  },
  async handler(ctx, { clerkUser }) {
    // Get primary email address
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryEmail =
      clerkUser.email_addresses.find(
        (email: { verification: { status: string } }) =>
          email.verification.status === "verified"
      ) || clerkUser.email_addresses[0];

    if (!primaryEmail) {
      throw new Error("User has no email address");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUser.id))
      .unique();

    const userData = {
      clerkId: clerkUser.id,
      email: primaryEmail.email_address,
      firstName: clerkUser.first_name || undefined,
      lastName: clerkUser.last_name || undefined,
      imageUrl: clerkUser.image_url || undefined,
      username: clerkUser.username || undefined,
      createdAt: clerkUser.created_at,
      updatedAt: clerkUser.updated_at,
    };

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, userData);
    } else {
      // Create new user
      return await ctx.db.insert("users", userData);
    }
  },
});

// Internal mutation to delete user from webhook
export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

// Internal query to get user by Clerk ID (used in auth) - from documentation
export const getUser = internalQuery({
  args: { subject: v.string() },
  async handler(ctx, args) {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.subject))
      .unique();
  },
});

// Internal query to get user by Clerk ID (used in auth)
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

// Public query to get current user
export const getCurrentUser = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Public query to get all users (for admin purposes)
export const getAllUsers = query({
  args: {},
  async handler(ctx) {
    // Only return basic info for privacy
    return await ctx.db
      .query("users")
      .collect()
      .then((users) =>
        users.map((user) => ({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
        }))
      );
  },
});
