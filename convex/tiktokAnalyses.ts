import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Content Creator Management Functions

// Get or create a content creator
export const getOrCreateContentCreator = mutation({
  args: {
    creatorId: v.string(),
    platform: v.string(),
    creatorName: v.optional(v.string()),
  },
  async handler(ctx, args) {
    // First, try to find existing creator
    const existingCreator = await ctx.db
      .query("contentCreators")
      .withIndex("by_creator_platform", (q) =>
        q.eq("creatorId", args.creatorId).eq("platform", args.platform)
      )
      .unique();

    if (existingCreator) {
      return existingCreator;
    }

    // Create new creator if not found
    const newCreatorId = await ctx.db.insert("contentCreators", {
      creatorId: args.creatorId,
      platform: args.platform,
      creatorName: args.creatorName,
      credibilityRating: 5.0, // Start with neutral rating
      totalAnalyses: 0,
      totalCredibilityScore: 0,
      lastAnalyzedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(newCreatorId);
  },
});

// Update creator credibility rating with weighted average
export const updateCreatorCredibilityRating = mutation({
  args: {
    contentCreatorId: v.id("contentCreators"),
    newRating: v.number(),
  },
  async handler(ctx, args) {
    const creator = await ctx.db.get(args.contentCreatorId);
    if (!creator) {
      throw new Error("Content creator not found");
    }

    // Calculate weighted average
    const newTotalAnalyses = creator.totalAnalyses + 1;
    const newTotalCredibilityScore =
      creator.totalCredibilityScore + args.newRating;
    const newWeightedRating = newTotalCredibilityScore / newTotalAnalyses;

    // Update creator record
    await ctx.db.patch(args.contentCreatorId, {
      credibilityRating: Math.round(newWeightedRating * 10) / 10, // Round to 1 decimal
      totalAnalyses: newTotalAnalyses,
      totalCredibilityScore: newTotalCredibilityScore,
      lastAnalyzedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.contentCreatorId);
  },
});

// Get content creator by ID and platform
export const getContentCreator = query({
  args: {
    creatorId: v.string(),
    platform: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("contentCreators")
      .withIndex("by_creator_platform", (q) =>
        q.eq("creatorId", args.creatorId).eq("platform", args.platform)
      )
      .unique();
  },
});

// Get top creators by credibility rating
export const getTopCreatorsByCredibility = query({
  args: {
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    let creators;

    if (args.platform) {
      creators = await ctx.db
        .query("contentCreators")
        .withIndex("by_platform", (q) => q.eq("platform", args.platform!))
        .collect();
    } else {
      creators = await ctx.db.query("contentCreators").collect();
    }

    // Sort by credibility rating (descending) and filter by minimum analyses
    return creators
      .filter((creator) => creator.totalAnalyses >= 2) // Only include creators with at least 2 analyses
      .sort((a, b) => b.credibilityRating - a.credibilityRating)
      .slice(0, args.limit || 10);
  },
});

// Get top credible sources (high credibility rating)
export const getTopCredibleSources = query({
  args: {
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    let creators;

    if (args.platform) {
      creators = await ctx.db
        .query("contentCreators")
        .withIndex("by_platform", (q) => q.eq("platform", args.platform!))
        .collect();
    } else {
      creators = await ctx.db.query("contentCreators").collect();
    }

    // Sort by credibility rating (descending) and filter by high credibility (>= 7.0)
    return creators
      .filter(
        (creator) =>
          // creator.totalAnalyses >= 2 &&
          creator.credibilityRating >= 7.0
      )
      .sort((a, b) => b.credibilityRating - a.credibilityRating)
      .slice(0, args.limit || 10);
  },
});

// Get top misinformation sources (low credibility rating)
export const getTopMisinformationSources = query({
  args: {
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    let creators;

    if (args.platform) {
      creators = await ctx.db
        .query("contentCreators")
        .withIndex("by_platform", (q) => q.eq("platform", args.platform!))
        .collect();
    } else {
      creators = await ctx.db.query("contentCreators").collect();
    }

    // Sort by credibility rating (ascending) and filter by low credibility (<= 4.0)
    return creators
      .filter(
        (creator) =>
          // creator.totalAnalyses >= 2 &&
          creator.credibilityRating <= 4.0
      )
      .sort((a, b) => a.credibilityRating - b.credibilityRating)
      .slice(0, args.limit || 10);
  },
});

// Get analyses by content creator
export const getAnalysesByCreator = query({
  args: {
    creatorId: v.string(),
    platform: v.string(),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // First get the content creator
    const creator = await ctx.db
      .query("contentCreators")
      .withIndex("by_creator_platform", (q) =>
        q.eq("creatorId", args.creatorId).eq("platform", args.platform)
      )
      .unique();

    if (!creator) {
      return [];
    }

    // Get all analyses for this creator
    const analyses = await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_content_creator", (q) =>
        q.eq("contentCreatorId", creator._id)
      )
      .order("desc")
      .take(args.limit || 50);

    return analyses;
  },
});

// Get comments for a content creator
export const getCreatorComments = query({
  args: {
    creatorId: v.string(),
    platform: v.string(),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const comments = await ctx.db
      .query("creatorComments")
      .withIndex("by_creator_platform", (q) =>
        q.eq("creatorId", args.creatorId).eq("platform", args.platform)
      )
      .order("desc")
      .take(args.limit || 20);

    // Get user info for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
              }
            : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

// Add a comment to a content creator
export const addCreatorComment = mutation({
  args: {
    creatorId: v.string(),
    platform: v.string(),
    content: v.string(),
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

    // Create the comment
    const commentId = await ctx.db.insert("creatorComments", {
      creatorId: args.creatorId,
      platform: args.platform,
      userId: user._id,
      content: args.content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(commentId);
  },
});

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

    // Check if analysis for this video URL already exists for this user
    const existingAnalysis = await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("videoUrl"), args.videoUrl))
      .unique();

    if (existingAnalysis) {
      // Return existing analysis ID instead of creating duplicate
      return existingAnalysis._id;
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

// Enhanced save TikTok analysis with creator credibility
export const saveTikTokAnalysisWithCredibility = mutation({
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
        verdict: v.optional(v.string()),
        confidence: v.optional(v.number()),
        explanation: v.optional(v.string()),
        content: v.optional(v.string()),
        isVerified: v.optional(v.boolean()),
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
    creatorCredibilityRating: v.optional(v.number()),
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

    // Check if analysis for this video URL already exists for this user
    const existingAnalysis = await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("videoUrl"), args.videoUrl))
      .unique();

    if (existingAnalysis) {
      // Return existing analysis ID instead of creating duplicate
      return existingAnalysis._id;
    }

    let contentCreatorId = undefined;

    // Handle content creator if metadata includes creator info
    if (
      args.metadata?.creator &&
      args.metadata?.platform &&
      args.creatorCredibilityRating !== undefined
    ) {
      // Get or create content creator
      const existingCreator = await ctx.db
        .query("contentCreators")
        .withIndex("by_creator_platform", (q) =>
          q
            .eq("creatorId", args.metadata?.creator ?? "")
            .eq("platform", args.metadata?.platform ?? "")
        )
        .unique();

      let creator;
      if (existingCreator) {
        creator = existingCreator;
      } else {
        // Create new creator if not found
        const newCreatorId = await ctx.db.insert("contentCreators", {
          creatorId: args.metadata!.creator!,
          platform: args.metadata!.platform!,
          creatorName: args.metadata.creator,
          credibilityRating: 5.0, // Start with neutral rating
          totalAnalyses: 0,
          totalCredibilityScore: 0,
          lastAnalyzedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        creator = await ctx.db.get(newCreatorId);
      }

      if (creator) {
        contentCreatorId = creator._id;

        // Update creator credibility rating with weighted average
        const newTotalAnalyses = creator.totalAnalyses + 1;
        const newTotalCredibilityScore =
          creator.totalCredibilityScore + args.creatorCredibilityRating;
        const newWeightedRating = newTotalCredibilityScore / newTotalAnalyses;

        await ctx.db.patch(creator._id, {
          credibilityRating: Math.round(newWeightedRating * 10) / 10, // Round to 1 decimal
          totalAnalyses: newTotalAnalyses,
          totalCredibilityScore: newTotalCredibilityScore,
          lastAnalyzedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // Save the analysis with creator reference
    const analysisId = await ctx.db.insert("tiktokAnalyses", {
      userId: user._id,
      videoUrl: args.videoUrl,
      transcription: args.transcription,
      metadata: args.metadata,
      newsDetection: args.newsDetection,
      factCheck: args.factCheck,
      requiresFactCheck: args.requiresFactCheck,
      creatorCredibilityRating: args.creatorCredibilityRating,
      contentCreatorId,
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

// Get all TikTok analyses for all users with pagination support
export const getAllAnalysesPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()), // cursor for pagination
  },
  async handler(ctx, args) {
    const limit = args.limit || 10;

    // Get all analyses, ordered by creation date (newest first)
    let query = ctx.db.query("tiktokAnalyses").order("desc");

    if (args.cursor) {
      // Use cursor for pagination
      query = query.filter((q) =>
        q.lt(q.field("_creationTime"), parseInt(args.cursor!))
      );
    }

    const results = await query.take(limit + 1); // Take one extra to check if there are more

    const hasMore = results.length > limit;
    const analyses = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore
      ? analyses[analyses.length - 1]._creationTime.toString()
      : null;

    return {
      analyses,
      hasMore,
      nextCursor,
    };
  },
});

// Get all analyses from all users
export const getAllAnalyses = query({
  async handler(ctx) {
    const analyses = await ctx.db
      .query("tiktokAnalyses")
      .order("desc")
      .collect();

    // Enrich analyses with user data
    return Promise.all(
      analyses.map(async (analysis) => {
        const user = await ctx.db.get(analysis.userId);
        return {
          ...analysis,
          user: user
            ? {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
              }
            : null,
        };
      })
    );
  },
});

// Legacy method for backward compatibility (without pagination)
export const getAllAnalysesLegacy = query({
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
    // Get the analysis - now public, no authorization required
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      return null;
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
