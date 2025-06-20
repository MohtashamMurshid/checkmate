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
  const content = (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-primary/20">
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
      className={`h-6 w-6 text-muted-foreground hidden md:block ${
        isReversed ? "rotate-180" : ""
      }`}
    />
  );

  return (
    <div
      className={`flex flex-col ${
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
