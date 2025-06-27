/**
 * General content utility functions
 */

export const generateIntelligentSummary = (text: string): string => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const summary =
    sentences.length > 2
      ? sentences.slice(0, 2).join(". ").trim() + "."
      : text.length > 150
        ? text.substring(0, 150).trim() + "..."
        : text;

  return summary;
};

export const extractKeyPoints = (text: string): string[] => {
  if (!text) return [];

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  if (sentences.length <= 3) return sentences.map((s) => s.trim());

  // Score sentences based on keywords, length, and position
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;

    // Position bias (first and last sentences often important)
    if (index === 0) score += 2;
    if (index === sentences.length - 1) score += 1;

    // Length bias (moderate length preferred)
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount >= 8 && wordCount <= 25) score += 2;

    // Keyword bias
    if (
      /\b(important|key|main|significant|remember|conclusion|summary)\b/gi.test(
        sentence
      )
    )
      score += 3;
    if (/\b(because|therefore|however|although|since|while)\b/gi.test(sentence))
      score += 1;

    return { sentence: sentence.trim(), score, index };
  });

  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);
};

export const generateTakeaways = (text: string): string[] => {
  const takeaways: string[] = [];

  if (/\b(learn|teach|how\s+to|tutorial|guide|tip)\b/gi.test(text)) {
    takeaways.push("Educational content with learning opportunities");
  }

  if (/\b(review|rating|recommend|test|experience)\b/gi.test(text)) {
    takeaways.push("Contains review or recommendation elements");
  }

  if (/\b(news|update|breaking|announcement|event)\b/gi.test(text)) {
    takeaways.push("Provides news or updates on current events");
  }

  if (/\b(opinion|think|believe|feel|perspective|view)\b/gi.test(text)) {
    takeaways.push("Shares personal opinions or perspectives");
  }

  if (/\b(funny|comedy|joke|laugh|humor|entertaining)\b/gi.test(text)) {
    takeaways.push("Entertainment content designed to amuse");
  }

  if (takeaways.length === 0) {
    takeaways.push("General content sharing information or experiences");
  }

  return takeaways.slice(0, 3);
};

export const calculateEstimatedReadingTime = (text: string): number => {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
};

export const analyzeContentDepth = (text: string): string => {
  if (text.length > 200) return "detailed";
  if (text.length > 50) return "moderate";
  return "brief";
};

export const determineCreatorStyle = (
  contentType: string,
  duration?: number
): string => {
  if (contentType === "video" && duration && duration > 60)
    return "Long-form video creator";
  if (contentType === "video" && duration && duration <= 60)
    return "Short-form video creator";
  if (contentType === "image_collection") return "Visual content creator";
  if (contentType === "audio") return "Audio content creator";
  return "Content creator";
};
