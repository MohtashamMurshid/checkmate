/**
 * Sentiment analysis helper functions
 */

export const calculateSentimentScore = (text: string): number => {
  const positiveWords = [
    "amazing",
    "awesome",
    "great",
    "excellent",
    "fantastic",
    "wonderful",
    "perfect",
    "love",
    "best",
    "good",
    "nice",
    "happy",
    "excited",
    "incredible",
    "brilliant",
    "outstanding",
    "superb",
    "marvelous",
    "fabulous",
    "delightful",
  ];

  const negativeWords = [
    "terrible",
    "awful",
    "bad",
    "horrible",
    "hate",
    "worst",
    "disgusting",
    "disappointing",
    "annoying",
    "frustrating",
    "sad",
    "angry",
    "upset",
    "pathetic",
    "useless",
    "garbage",
    "trash",
    "stupid",
    "ridiculous",
    "fake",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return 0; // neutral

  return (positiveCount - negativeCount) / Math.max(totalSentimentWords, 1);
};

export const extractEmotions = (text: string): string[] => {
  const emotions: string[] = [];

  if (/\b(excited|amazing|wow|incredible)\b/gi.test(text))
    emotions.push("excited");
  if (/\b(worried|concerned|afraid|scared)\b/gi.test(text))
    emotions.push("concerned");
  if (/\b(funny|hilarious|laugh|joke)\b/gi.test(text))
    emotions.push("humorous");
  if (/\b(learn|educational|informative|teach)\b/gi.test(text))
    emotions.push("informative");
  if (/\b(angry|mad|furious|upset)\b/gi.test(text)) emotions.push("angry");
  if (/\b(sad|depressed|disappointed)\b/gi.test(text)) emotions.push("sad");

  return emotions.length > 0 ? emotions : ["neutral"];
};

export const determineOverallSentiment = (sentimentScore: number): string => {
  if (sentimentScore > 0.2) return "positive";
  if (sentimentScore < -0.2) return "negative";
  return "neutral";
};

export const calculateSentimentConfidence = (
  sentimentScore: number
): number => {
  return Math.abs(sentimentScore) > 0.1 ? 0.8 : 0.5;
};
