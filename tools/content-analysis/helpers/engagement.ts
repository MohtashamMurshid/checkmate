/**
 * Engagement assessment helper functions
 */

export interface EngagementPotential {
  level: string;
  score: number;
  factors: string[];
}

export const assessEngagementPotential = (
  text: string,
  hashtags?: string[]
): EngagementPotential => {
  let score = 0.5; // Base score
  const factors: string[] = [];

  // Check for engagement indicators
  if (text.includes("?")) {
    score += 0.1;
    factors.push("Contains questions");
  }

  if (/\b(like|share|follow|subscribe|comment)\b/gi.test(text)) {
    score += 0.15;
    factors.push("Has call-to-action");
  }

  if (hashtags && hashtags.length > 0) {
    score += Math.min(hashtags.length * 0.05, 0.2);
    factors.push(`Uses ${hashtags.length} hashtags`);
  }

  if (/\b(trending|viral|popular|hot|new)\b/gi.test(text)) {
    score += 0.1;
    factors.push("References trending topics");
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > 50 && wordCount < 200) {
    score += 0.1;
    factors.push("Optimal content length");
  }

  // Determine level
  let level = "low";
  if (score >= 0.8) level = "high";
  else if (score >= 0.6) level = "medium";

  return { level, score: Math.min(score, 1), factors };
};

export const analyzeEngagementElements = (text: string) => {
  return {
    has_call_to_action:
      /\b(like|share|follow|subscribe|comment|check\s+out|visit|click)\b/gi.test(
        text
      ),
    has_questions: /\?/.test(text),
    has_emotional_appeal:
      /\b(amazing|incredible|shocking|unbelievable|must\s+see|wow)\b/gi.test(
        text
      ),
    has_urgency: /\b(now|today|urgent|limited|hurry|quick|fast)\b/gi.test(text),
    educational_value:
      /\b(learn|teach|tutorial|how\s+to|guide|tips|explain|show)\b/gi.test(
        text
      ),
    entertainment_value:
      /\b(fun|funny|comedy|joke|laugh|entertaining|amusing)\b/gi.test(text),
  };
};

export const calculateReadabilityScore = (text: string): number => {
  const wordCount = text.split(/\s+/).length;
  return Math.max(0, Math.min(10, 10 - wordCount / 50));
};
