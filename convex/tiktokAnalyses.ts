import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save TikTok analysis results
export const saveTikTokAnalysis = mutation({
  args: {
    videoUrl: v.string(),
    transcription: v.optional(
      v.object({
        text: v.string(),
        duration: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),
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
    requiresFactCheck: v.boolean(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Save the analysis
    const analysisId = await ctx.db.insert("tiktokAnalyses", {
      userId: user._id,
      videoUrl: args.videoUrl,
      transcription: args.transcription,
      metadata: args.metadata,
      newsDetection: args.newsDetection,
      factCheck: args.factCheck,
      requiresFactCheck: args.requiresFactCheck,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});

// Get all TikTok analyses for the current user
export const getUserTikTokAnalyses = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all analyses for this user, ordered by creation date (newest first)
    return await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get all TikTok analyses for all users
export const getAllAnalyses = query({
  args: {},
  async handler(ctx) {
    // Get all analyses, ordered by creation date (newest first)
    return await ctx.db.query("tiktokAnalyses").order("desc").collect();
  },
});

// Get a specific TikTok analysis by ID
export const getTikTokAnalysisById = query({
  args: { analysisId: v.id("tiktokAnalyses") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the analysis
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      return null;
    }

    // Get the user to verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Unauthorized access");
    }

    return analysis;
  },
});

// Get recent analyses that require fact-checking
export const getAnalysesRequiringFactCheck = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get analyses that require fact-checking
    const analyses = await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_requires_fact_check", (q) =>
        q.eq("requiresFactCheck", true)
      )
      .order("desc")
      .collect();

    // Filter by user and apply limit
    const userAnalyses = analyses
      .filter((analysis) => analysis.userId === user._id)
      .slice(0, args.limit || 10);

    return userAnalyses;
  },
});

// Delete a TikTok analysis
export const deleteTikTokAnalysis = mutation({
  args: { analysisId: v.id("tiktokAnalyses") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the analysis
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Get the user to verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Unauthorized access");
    }

    // Delete the analysis
    await ctx.db.delete(args.analysisId);
    return { success: true };
  },
});

// Get analysis statistics for all users
export const getAllAnalysisStats = query({
  args: {},
  async handler(ctx) {
    const allAnalyses = await ctx.db.query("tiktokAnalyses").collect();

    if (allAnalyses.length === 0) {
      return {
        totalAnalyses: 0,
        requiresFactCheck: 0,
        hasNewsContent: 0,
        factCheckSummary: {
          verifiedTrue: 0,
          verifiedFalse: 0,
          misleading: 0,
          unverifiable: 0,
          needsVerification: 0,
        },
      };
    }

    const stats = allAnalyses.reduce(
      (acc, analysis) => {
        if (analysis.requiresFactCheck) {
          acc.requiresFactCheck++;
        }
        if (analysis.newsDetection?.hasNewsContent) {
          acc.hasNewsContent++;
        }
        if (analysis.factCheck?.summary) {
          acc.factCheckSummary.verifiedTrue +=
            analysis.factCheck.summary.verifiedTrue;
          acc.factCheckSummary.verifiedFalse +=
            analysis.factCheck.summary.verifiedFalse;
          acc.factCheckSummary.misleading +=
            analysis.factCheck.summary.misleading;
          acc.factCheckSummary.unverifiable +=
            analysis.factCheck.summary.unverifiable;
          acc.factCheckSummary.needsVerification +=
            analysis.factCheck.summary.needsVerification;
        }
        return acc;
      },
      {
        requiresFactCheck: 0,
        hasNewsContent: 0,
        factCheckSummary: {
          verifiedTrue: 0,
          verifiedFalse: 0,
          misleading: 0,
          unverifiable: 0,
          needsVerification: 0,
        },
      }
    );

    return {
      totalAnalyses: allAnalyses.length,
      ...stats,
    };
  },
});

// Get analysis statistics for the user
export const getUserAnalysisStats = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get all analyses for this user
    const analyses = await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalAnalyses = analyses.length;
    const requiresFactCheck = analyses.filter(
      (a) => a.requiresFactCheck
    ).length;
    const hasNewsContent = analyses.filter(
      (a) => a.newsDetection?.hasNewsContent
    ).length;

    // Calculate fact-check summary across all analyses
    let totalVerifiedTrue = 0;
    let totalVerifiedFalse = 0;
    let totalMisleading = 0;
    let totalUnverifiable = 0;
    let totalNeedsVerification = 0;

    analyses.forEach((analysis) => {
      if (analysis.factCheck?.summary) {
        totalVerifiedTrue += analysis.factCheck.summary.verifiedTrue;
        totalVerifiedFalse += analysis.factCheck.summary.verifiedFalse;
        totalMisleading += analysis.factCheck.summary.misleading;
        totalUnverifiable += analysis.factCheck.summary.unverifiable;
        totalNeedsVerification += analysis.factCheck.summary.needsVerification;
      }
    });

    return {
      totalAnalyses,
      requiresFactCheck,
      hasNewsContent,
      factCheckSummary: {
        verifiedTrue: totalVerifiedTrue,
        verifiedFalse: totalVerifiedFalse,
        misleading: totalMisleading,
        unverifiable: totalUnverifiable,
        needsVerification: totalNeedsVerification,
      },
    };
  },
});
