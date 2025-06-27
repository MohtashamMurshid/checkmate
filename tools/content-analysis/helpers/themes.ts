/**
 * Theme extraction and categorization helper functions
 */

export const extractThemes = (
  text: string,
  title?: string,
  hashtags?: string[]
): string[] => {
  const themes = new Set<string>();

  // Common themes patterns
  const themePatterns = {
    educational:
      /\b(learn|teach|tutorial|how\s+to|guide|tips|education|explain|show)\b/gi,
    entertainment:
      /\b(fun|funny|comedy|joke|laugh|entertaining|amusing|hilarious)\b/gi,
    lifestyle:
      /\b(life|daily|routine|style|fashion|beauty|health|fitness|food|travel)\b/gi,
    technology:
      /\b(tech|technology|app|software|digital|internet|ai|computer|phone)\b/gi,
    news: /\b(news|breaking|update|report|announcement|alert|happening|event)\b/gi,
    opinion:
      /\b(think|believe|opinion|feel|personal|view|perspective|consider)\b/gi,
    review:
      /\b(review|rating|recommend|test|try|experience|comparison|versus)\b/gi,
    diy: /\b(diy|do\s+it\s+yourself|make|create|build|craft|handmade)\b/gi,
  };

  const fullText = [text, title, ...(hashtags || [])].join(" ").toLowerCase();

  Object.entries(themePatterns).forEach(([theme, pattern]) => {
    if (pattern.test(fullText)) {
      themes.add(theme);
    }
  });

  return Array.from(themes);
};

export const categorizeContent = (themes: string[]): string => {
  if (themes.includes("educational")) return "educational";
  if (themes.includes("entertainment")) return "entertainment";
  if (themes.includes("news")) return "news";
  if (themes.includes("lifestyle")) return "lifestyle";
  if (themes.includes("technology")) return "technology";
  return "general";
};

export const extractKeywords = (text: string): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        ![
          "this",
          "that",
          "with",
          "from",
          "they",
          "have",
          "been",
          "were",
          "said",
          "each",
          "which",
          "their",
          "time",
          "will",
        ].includes(word)
    );

  const wordFreq = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};
