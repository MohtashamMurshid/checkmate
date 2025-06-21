"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlayIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
  XCircleIcon,
} from "lucide-react";
import { useTikTokAnalysis } from "@/lib/hooks/use-tiktok-analysis";

interface HeroSectionProps {
  initialUrl?: string;
}

export function HeroSection({ initialUrl = "" }: HeroSectionProps) {
  const [url, setUrl] = useState(initialUrl);
  const { analyzeTikTok, isLoading, result, reset } = useTikTokAnalysis();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          if (entry.intersectionRatio === 0) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: [0, 0.1],
        rootMargin: "100px 0px 100px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    // Update URL with query parameter
    const params = new URLSearchParams();
    params.set("link", url.trim());
    router.replace(`?${params.toString()}`);

    await analyzeTikTok(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAnalyze();
  };

  const handleReset = () => {
    setUrl("");
    reset();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "true":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "false":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case "misleading":
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case "unverifiable":
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircleIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "true":
        return (
          <Badge className="bg-green-100 text-green-800">Verified True</Badge>
        );
      case "false":
        return <Badge className="bg-red-100 text-red-800">False</Badge>;
      case "misleading":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Misleading</Badge>
        );
      case "unverifiable":
        return (
          <Badge className="bg-gray-100 text-gray-800">Unverifiable</Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Needs Verification
          </Badge>
        );
    }
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" ref={elementRef}>
      {/* Background parallax layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      <div className="text-center relative z-10">
        {/* Badge */}
        <div 
          className={`transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-top-4' 
              : 'opacity-0 -translate-y-4'
          }`}
          style={{ 
            animationDelay: isVisible ? '0ms' : '0ms',
            animationFillMode: 'both',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <Badge variant="secondary" className="mb-4">
            AI-Powered Fact Checking
          </Badge>
        </div>

        {/* Title */}
        <div 
          className={`transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-bottom-6' 
              : 'opacity-0 translate-y-6'
          }`}
          style={{ 
            animationDelay: isVisible ? '100ms' : '0ms',
            animationFillMode: 'both',
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Verify TikTok Content with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Checkmate
            </span>
          </h1>
        </div>

        {/* Description */}
        <div 
          className={`transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-top-6' 
              : 'opacity-0 -translate-y-6'
          }`}
          style={{ 
            animationDelay: isVisible ? '200ms' : '0ms',
            animationFillMode: 'both',
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        >
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Combat misinformation with our AI-powered fact-checking tool. Paste
            any TikTok link to get instant transcription, news detection, and
            credibility reports with verified sources.
          </p>
        </div>

        {/* Demo Input */}
        <div 
          className={`mx-auto max-w-2xl space-y-4 transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-bottom-8' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            animationDelay: isVisible ? '300ms' : '0ms',
            animationFillMode: 'both',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 items-center justify-center"
          >
            <Input
              placeholder="Paste TikTok link here..."
              className="flex-1 h-12 text-base min-w-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
          <div 
            className={`mx-auto max-w-4xl mt-8 transition-all duration-300 ${
              isVisible 
                ? 'animate-in fade-in slide-in-from-bottom-8' 
                : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              animationDelay: isVisible ? '400ms' : '0ms',
              animationFillMode: 'both',
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
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
                  <div className="space-y-6 text-left">
                    {/* Video Metadata */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {result.data.metadata.title}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Creator: {result.data.metadata.creator}</p>
                        <p>Original URL: {result.data.metadata.originalUrl}</p>
                      </div>
                    </div>

                    {/* Transcription */}
                    {result.data.transcription && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4" />
                          Transcription
                        </h4>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm leading-relaxed">
                            &ldquo;{result.data.transcription.text}&rdquo;
                          </p>
                          {result.data.transcription.language && (
                            <p className="text-xs text-muted-foreground mt-3">
                              Language: {result.data.transcription.language}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* News Detection */}
                    {result.data.newsDetection && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4" />
                          Content Analysis
                        </h4>
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Content Type:</span>
                            <Badge
                              variant={
                                result.data.newsDetection.contentType ===
                                "news_factual"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.data.newsDetection.contentType ===
                              "news_factual"
                                ? "News/Factual"
                                : "Entertainment"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              Requires Fact-Check:
                            </span>
                            <Badge
                              variant={
                                result.data.requiresFactCheck
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.data.requiresFactCheck ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Confidence:</span>
                            <span className="text-sm font-medium">
                              {Math.round(
                                result.data.newsDetection.confidence * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fact-Check Results */}
                    {result.data.factCheck &&
                      result.data.factCheck.results.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Fact-Check Results (
                            {result.data.factCheck.checkedClaims} claims
                            analyzed)
                          </h4>

                          {/* Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-green-700">
                                {result.data.factCheck.summary.verifiedTrue}
                              </div>
                              <div className="text-xs text-green-600">
                                Verified True
                              </div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-red-700">
                                {result.data.factCheck.summary.verifiedFalse}
                              </div>
                              <div className="text-xs text-red-600">False</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-yellow-700">
                                {result.data.factCheck.summary.misleading}
                              </div>
                              <div className="text-xs text-yellow-600">
                                Misleading
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-gray-700">
                                {result.data.factCheck.summary.unverifiable}
                              </div>
                              <div className="text-xs text-gray-600">
                                Unverifiable
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-700">
                                {
                                  result.data.factCheck.summary
                                    .needsVerification
                                }
                              </div>
                              <div className="text-xs text-blue-600">
                                Needs Review
                              </div>
                            </div>
                          </div>

                          {/* Individual Claims */}
                          <div className="space-y-3">
                            {result.data.factCheck.results.map(
                              (factCheck, index) => (
                                <Card
                                  key={index}
                                  className="border-l-4 border-l-blue-500"
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm flex-1 font-medium">
                                          Claim: &ldquo;{factCheck.claim}&rdquo;
                                        </p>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {getStatusIcon(factCheck.status)}
                                          {getStatusBadge(factCheck.status)}
                                        </div>
                                      </div>

                                      {factCheck.analysis && (
                                        <div className="bg-gray-50 p-3 rounded text-xs">
                                          <p className="font-medium mb-1">
                                            Analysis:
                                          </p>
                                          <p>
                                            {factCheck.analysis.substring(
                                              0,
                                              200
                                            )}
                                            ...
                                          </p>
                                        </div>
                                      )}

                                      {factCheck.sources &&
                                        factCheck.sources.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium mb-2">
                                              Sources:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {factCheck.sources
                                                .slice(0, 3)
                                                .map((source, sourceIndex) => (
                                                  <Button
                                                    key={sourceIndex}
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                  >
                                                    <a
                                                      href={source.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs"
                                                    >
                                                      {source.source}
                                                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                                                    </a>
                                                  </Button>
                                                ))}
                                            </div>
                                          </div>
                                        )}

                                      <div className="text-xs text-muted-foreground">
                                        Confidence:{" "}
                                        {Math.round(factCheck.confidence * 100)}
                                        %
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Reset Button */}
                    <div className="pt-4 border-t">
                      <Button variant="outline" onClick={handleReset}>
                        Analyze Another Video
                      </Button>
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
