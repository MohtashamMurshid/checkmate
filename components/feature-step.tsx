"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircleIcon, ArrowRightIcon } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FeatureStepProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  isReversed?: boolean;
  showArrow?: boolean;
}

export function FeatureStep({
  step,
  title,
  description,
  icon: Icon,
  features,
  isReversed = false,
  showArrow = true,
}: FeatureStepProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Only reset when completely out of view
          if (entry.intersectionRatio === 0) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: [0, 0.1], // Multiple thresholds to detect when completely out of view
        rootMargin: "100px 0px 100px 0px", // More generous margins
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const content = (
    <div 
      className={`w-full max-w-2xl mx-auto transition-all duration-300 ${
        isVisible 
          ? 'animate-in fade-in' + (isReversed ? ' slide-in-from-right-8' : ' slide-in-from-left-8')
          : 'opacity-0' + (isReversed ? ' translate-x-8' : ' -translate-x-8')
      }`}
      style={{ 
        animationDelay: isVisible ? `${(step - 1) * 100}ms` : '0ms',
        animationFillMode: 'both'
      }}
    >
      <Card className="border transition-transform duration-300 hover:scale-95 hover:shadow-xl shadow-[0_0_16px_2px_rgba(236,72,153,0.12)] relative before:content-[''] before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:z-[-1] before:shadow-[0_2px_16px_4px_rgba(236,72,153,0.08)] dark:shadow-[0_0_24px_4px_rgba(219,39,119,0.18)] dark:before:shadow-[0_4px_32px_8px_rgba(219,39,119,0.12)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="mb-2">
                Step {step}
              </Badge>
              <CardTitle>{title}</CardTitle>
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const arrow = showArrow && (
    <ArrowRightIcon
      className={`h-6 w-6 text-muted-foreground hidden md:block transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-4'
      } ${isReversed
          ? 'ml-8 group-hover:ml-2 translate-x-0 group-hover:translate-x-2 rotate-180 group-hover:translate-y-1'
          : 'mr-8 group-hover:mr-2 translate-x-0 group-hover:translate-x-2 group-hover:-translate-y-1'}
      `}
      style={{ 
        animationDelay: isVisible ? `${(step - 1) * 100 + 50}ms` : '0ms',
      }}
    />
  );

  return (
    <div
      ref={elementRef}
      className={`group flex flex-col ${
        isReversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-center justify-center gap-8`}
    >
      {isReversed ? (
        <>
          {content}
          {arrow}
        </>
      ) : (
        <>
          {content}
          {arrow}
        </>
      )}
    </div>
  );
}
