import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  // Users table synced from Clerk via webhooks
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // TikTok analysis results linked to users
  tiktokAnalyses: defineTable({
    userId: v.id("users"), // References the users table
    videoUrl: v.string(),
    transcription: v.optional(v.string()),
    analysis: v.optional(
      v.object({
        credibilityScore: v.number(),
        factCheckResults: v.array(
          v.object({
            claim: v.string(),
            verification: v.string(),
            sources: v.array(v.string()),
          })
        ),
        summary: v.string(),
      })
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});

export default schema;
