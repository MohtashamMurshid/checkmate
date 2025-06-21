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

    // Transcription data
    transcription: v.optional(
      v.object({
        text: v.string(),
        duration: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),

    // Video metadata
    metadata: v.optional(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        creator: v.optional(v.string()),
        originalUrl: v.string(),
        contentType: v.optional(v.string()),
        platform: v.optional(v.string()),
      })
    ),

    // News detection results
    newsDetection: v.optional(
      v.object({
        hasNewsContent: v.boolean(),
        confidence: v.number(),
        newsKeywordsFound: v.array(v.string()),
        potentialClaims: v.array(v.string()),
        needsFactCheck: v.boolean(),
        contentType: v.string(),
      })
    ),

    // Fact-check results - Updated to match route.ts FactCheckData interface
    factCheck: v.optional(
      v.object({
        verdict: v.optional(v.string()), // "true", "false", "misleading", "unverifiable"
        confidence: v.optional(v.number()), // Percentage (0-100)
        explanation: v.optional(v.string()), // Analysis explanation
        content: v.optional(v.string()), // Content summary
        isVerified: v.optional(v.boolean()), // Whether verification was successful
        sources: v.optional(
          v.array(
            v.object({
              title: v.string(),
              url: v.string(),
              source: v.optional(v.string()),
              relevance: v.optional(v.number()),
            })
          )
        ),
        error: v.optional(v.string()),
        // Legacy fields for backward compatibility
        totalClaims: v.optional(v.number()),
        checkedClaims: v.optional(v.number()),
        results: v.optional(
          v.array(
            v.object({
              claim: v.string(),
              status: v.string(),
              confidence: v.number(),
              analysis: v.optional(v.string()),
              sources: v.array(v.string()),
              error: v.optional(v.string()),
            })
          )
        ),
        summary: v.optional(
          v.object({
            verifiedTrue: v.number(),
            verifiedFalse: v.number(),
            misleading: v.number(),
            unverifiable: v.number(),
            needsVerification: v.number(),
          })
        ),
      })
    ),

    // Analysis flags
    requiresFactCheck: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"])
    .index("by_requires_fact_check", ["requiresFactCheck"])
    .index("by_user_and_platform", ["userId", "metadata.platform"]),
});

export default schema;
