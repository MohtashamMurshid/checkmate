"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlayIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon,
} from "lucide-react";
import { useTikTokAnalysis } from "@/lib/hooks/use-tiktok-analysis";

interface HeroSectionProps {
  initialUrl?: string;
}

export function HeroSection({ initialUrl = "" }: HeroSectionProps) {
  const [url, setUrl] = useState(initialUrl);
  const { analyzeTikTok, isLoading, result, reset } = useTikTokAnalysis();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);

    // Update URL params immediately
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (newUrl.trim()) {
      current.set("link", newUrl.trim());
      router.replace(`?${current.toString()}`, { scroll: false });
    } else {
      current.delete("link");
      const search = current.toString();
      router.replace(search ? `?${search}` : "/", { scroll: false });
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    await analyzeTikTok(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAnalyze();
  };

  const handleReset = () => {
    setUrl("");
    reset();

    // Clear URL params
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("link");
    const search = current.toString();
    router.replace(search ? `?${search}` : "/", { scroll: false });
  };

  return (
    <section className="py-24 md:py-32">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Fact Checking
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Verify TikTok Content with{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Checkmate
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Combat misinformation with our AI-powered fact-checking tool. Paste
          any TikTok link to get instant transcription, news detection, and
          credibility reports with verified sources.
        </p>

        {/* Demo Input */}
        <div className="mx-auto max-w-2xl space-y-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 items-center justify-center"
          >
            <Input
              placeholder="Paste TikTok link here..."
              className="flex-1 h-12 text-base min-w-0"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="px-6 h-12 shrink-0"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center">
            Try it with any TikTok video URL to see the magic happen
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="mx-auto max-w-2xl mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {result.success ? "Analysis Complete" : "Analysis Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success && result.data ? (
                  <div className="space-y-4 text-left">
                    <div className="flex gap-4">
                      <img
                        src={result.data.thumbnail}
                        alt="TikTok thumbnail"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{result.data.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Content Type:{" "}
                          {result.data.metadata.contentType === "video"
                            ? "Video"
                            : "Image Collection"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Creator: {result.data.metadata.creator}
                        </p>
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Download Options:
                      </h4>

                      {/* Video Downloads */}
                      {result.data.hasVideo && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Video:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.data.downloadLinks.video.hd && (
                              <Button size="sm" asChild>
                                <a
                                  href={result.data.downloadLinks.video.hd}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon className="h-3 w-3 mr-1" />
                                  HD Quality
                                </a>
                              </Button>
                            )}
                            {result.data.downloadLinks.video.standard && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={
                                    result.data.downloadLinks.video.standard
                                  }
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon className="h-3 w-3 mr-1" />
                                  Standard
                                </a>
                              </Button>
                            )}
                            {result.data.downloadLinks.video.alternative &&
                              result.data.downloadLinks.video.alternative !==
                                result.data.downloadLinks.video.standard && (
                                <Button size="sm" variant="outline" asChild>
                                  <a
                                    href={
                                      result.data.downloadLinks.video
                                        .alternative
                                    }
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <DownloadIcon className="h-3 w-3 mr-1" />
                                    Alternative
                                  </a>
                                </Button>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Image Downloads */}
                      {result.data.hasImages &&
                        result.data.downloadLinks.images.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Images ({result.data.downloadLinks.images.length}
                              ):
                            </p>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {result.data.downloadLinks.images.map(
                                (imageUrl, index) => (
                                  <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    asChild
                                  >
                                    <a
                                      href={imageUrl}
                                      download={`tiktok-image-${index + 1}.jpg`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <DownloadIcon className="h-3 w-3 mr-1" />
                                      Image {index + 1}
                                    </a>
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Audio Download */}
                      {result.data.hasAudio &&
                        result.data.downloadLinks.audio && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Audio:
                            </p>
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={result.data.downloadLinks.audio}
                                download="tiktok-audio.mp3"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <DownloadIcon className="h-3 w-3 mr-1" />
                                Download Audio
                              </a>
                            </Button>
                          </div>
                        )}

                      {/* Transcription */}
                      {result.data.transcription && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Transcription:
                          </p>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              &ldquo;{result.data.transcription.text}&rdquo;
                            </p>
                            {result.data.transcription.language && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Language: {result.data.transcription.language}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reset Button */}
                      <div className="pt-2 border-t">
                        <Button variant="outline" onClick={handleReset}>
                          Analyze Another
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-left">
                    <p className="text-red-500 mb-4">{result.error}</p>
                    <Button variant="outline" onClick={handleReset}>
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
