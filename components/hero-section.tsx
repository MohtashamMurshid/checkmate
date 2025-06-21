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
      
      {/* Animated Misinformation Spread Background */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        {/* TikTok Video Icons */}
        <div className="absolute top-12 left-8 w-8 h-8 bg-black rounded-lg opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TT</div>
        </div>
        <div className="absolute top-32 right-32 w-8 h-8 bg-black rounded-lg opacity-10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TT</div>
        </div>
        <div className="absolute bottom-24 left-12 w-8 h-8 bg-black rounded-lg opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TT</div>
        </div>
        <div className="absolute top-64 left-64 w-8 h-8 bg-black rounded-lg opacity-10 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TT</div>
        </div>

        {/* Facebook Icons */}
        <div className="absolute top-24 right-20 w-8 h-8 bg-blue-600 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">f</div>
        </div>
        <div className="absolute bottom-16 right-40 w-8 h-8 bg-blue-600 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">f</div>
        </div>
        <div className="absolute top-48 left-80 w-8 h-8 bg-blue-600 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '2s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">f</div>
        </div>

        {/* WhatsApp Icons */}
        <div className="absolute top-8 left-24 w-8 h-8 bg-green-500 rounded-full opacity-10 animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">W</div>
        </div>
        <div className="absolute bottom-32 left-32 w-8 h-8 bg-green-500 rounded-full opacity-10 animate-ping" style={{ animationDelay: '2s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">W</div>
        </div>
        <div className="absolute top-56 right-80 w-8 h-8 bg-green-500 rounded-full opacity-10 animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">W</div>
        </div>

        {/* Instagram Icons */}
        <div className="absolute top-20 left-48 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-10 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">IG</div>
        </div>
        <div className="absolute bottom-20 right-16 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-10 animate-pulse" style={{ animationDelay: '0s', animationDuration: '2.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">IG</div>
        </div>
        <div className="absolute top-40 right-80 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-10 animate-pulse" style={{ animationDelay: '3s', animationDuration: '2.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">IG</div>
        </div>

        {/* YouTube Icons */}
        <div className="absolute top-36 left-16 w-8 h-8 bg-red-600 rounded opacity-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">YT</div>
        </div>
        <div className="absolute bottom-28 right-64 w-8 h-8 bg-red-600 rounded opacity-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">YT</div>
        </div>
        <div className="absolute top-72 left-56 w-8 h-8 bg-red-600 rounded opacity-10 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">YT</div>
        </div>

        {/* Twitter/X Icons */}
        <div className="absolute top-44 left-4 w-8 h-8 bg-black rounded-full opacity-10 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">X</div>
        </div>
        <div className="absolute bottom-12 left-56 w-8 h-8 bg-black rounded-full opacity-10 animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">X</div>
        </div>
        <div className="absolute top-16 right-48 w-8 h-8 bg-black rounded-full opacity-10 animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">X</div>
        </div>

        {/* LinkedIn Icons */}
        <div className="absolute top-60 left-20 w-8 h-8 bg-blue-700 rounded-sm opacity-10 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.8s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">Li</div>
        </div>
        <div className="absolute bottom-8 right-24 w-8 h-8 bg-blue-700 rounded-sm opacity-10 animate-pulse" style={{ animationDelay: '0s', animationDuration: '2.8s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">Li</div>
        </div>

        {/* Snapchat Icons */}
        <div className="absolute top-28 left-72 w-8 h-8 bg-yellow-400 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-black text-xs font-bold">SC</div>
        </div>
        <div className="absolute bottom-44 right-8 w-8 h-8 bg-yellow-400 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
          <div className="w-full h-full flex items-center justify-center text-black text-xs font-bold">SC</div>
        </div>

        {/* Telegram Icons */}
        <div className="absolute top-52 right-28 w-8 h-8 bg-blue-500 rounded-full opacity-10 animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TG</div>
        </div>
        <div className="absolute bottom-36 left-8 w-8 h-8 bg-blue-500 rounded-full opacity-10 animate-ping" style={{ animationDelay: '3s', animationDuration: '3.5s' }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">TG</div>
        </div>

        {/* Misinformation Spread Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" style={{ zIndex: -1 }}>
          <defs>
            <linearGradient id="misinfoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated spreading lines */}
          <path 
            d="M 50 100 Q 150 80 250 120 T 450 100" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <path 
            d="M 100 300 Q 200 250 300 280 T 500 260" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s', animationDelay: '1s' }}
          />
          <path 
            d="M 40 200 Q 120 160 200 180 T 380 160" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '2s' }}
          />
          <path 
            d="M 200 80 Q 300 120 400 100 T 600 120" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
          />
          <path 
            d="M 80 350 Q 180 320 280 340 T 480 320" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}
          />
          <path 
            d="M 160 60 Q 240 90 320 70 T 520 90" 
            stroke="url(#misinfoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2.5s' }}
          />
        </svg>

        {/* Floating Warning Signs */}
        <div className="absolute top-18 right-56 text-red-500 opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-16 text-yellow-500 opacity-30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">?</span>
          </div>
        </div>
        <div className="absolute top-40 left-28 text-orange-500 opacity-30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
        </div>
        <div className="absolute top-68 right-36 text-red-400 opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
        </div>
        <div className="absolute bottom-52 right-72 text-yellow-400 opacity-30 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3.2s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">?</span>
          </div>
        </div>
        <div className="absolute top-32 left-60 text-orange-400 opacity-30 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.7s' }}>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
        </div>

        {/* Floating Text Snippets */}
        <div className="absolute top-24 left-52 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          "Breaking News..."
        </div>
        <div className="absolute bottom-28 right-44 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '3s' }}>
          "You won't believe..."
        </div>
        <div className="absolute top-44 right-68 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '5s' }}>
          "Scientists hate this..."
        </div>
        <div className="absolute top-12 right-72 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          "Doctors shocked..."
        </div>
        <div className="absolute bottom-16 left-44 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}>
          "This will change everything..."
        </div>
        <div className="absolute top-56 left-8 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '3s', animationDuration: '3.8s' }}>
          "Exclusive footage..."
        </div>
        <div className="absolute bottom-40 right-32 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '4.2s' }}>
          "Government doesn't want..."
        </div>
        <div className="absolute top-20 left-76 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '2.8s', animationDuration: '3.3s' }}>
          "Leaked documents..."
        </div>
        <div className="absolute bottom-60 left-60 text-xs text-muted-foreground/40 animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '4.8s' }}>
          "Viral video reveals..."
        </div>
      </div>
      
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
