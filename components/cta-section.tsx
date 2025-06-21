"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="border-t bg-muted/20 py-24" ref={elementRef}>
      <div className="text-center">
        {/* Title */}
        <div 
          className={`transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-top-6' 
              : 'opacity-0 -translate-y-6'
          }`}
          style={{ 
            animationDelay: isVisible ? '0ms' : '0ms',
            animationFillMode: 'both'
          }}
        >
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Fight Misinformation?
          </h2>
        </div>

        {/* Description */}
        <div 
          className={`transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-bottom-6' 
              : 'opacity-0 translate-y-6'
          }`}
          style={{ 
            animationDelay: isVisible ? '100ms' : '0ms',
            animationFillMode: 'both'
          }}
        >
          <p className="mb-8 text-lg text-muted-foreground">
            Join the fight against misinformation. Start fact-checking TikTok
            content today.
          </p>
        </div>

        {/* Buttons */}
        <div 
          className={`flex gap-4 justify-center transition-all duration-300 ${
            isVisible 
              ? 'animate-in fade-in slide-in-from-bottom-8' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            animationDelay: isVisible ? '200ms' : '0ms',
            animationFillMode: 'both'
          }}
        >
          <Button size="lg" className="px-8">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
