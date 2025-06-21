"use client";

import { AllAnalyses } from "@/components/all-analyses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import {
  useCredibleSources,
  useMisinformationSources,
} from "@/lib/hooks/use-credible-sources";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

const TopCredibleSources = () => {
  const credibleSources = useCredibleSources(undefined, 5);
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 " />
          {t.topCredibleSources}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {credibleSources === undefined ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))
        ) : credibleSources?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.noCredibleSources}
          </p>
        ) : (
          credibleSources?.map((creator) => (
            <div
              key={`${creator.creatorId}-${creator.platform}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-lg">
                  {(creator.creatorName || creator.creatorId)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">
                    {creator.creatorName || creator.creatorId}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="capitalize">{creator.platform}</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      {creator.credibilityRating.toFixed(1)}/10
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/creator/${encodeURIComponent(creator.creatorId)}?platform=${creator.platform}`
                  )
                }
              >
                {t.viewDetails}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const TopMisinformationSources = () => {
  const misinformationSources = useMisinformationSources(undefined, 5);
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <XCircle className="h-5 w-5 " />
          {t.topMisinformationSources}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {misinformationSources === undefined ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : misinformationSources?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.noMisinformationSources}
          </p>
        ) : (
          misinformationSources?.map((creator) => (
            <div
              key={`${creator.creatorId}-${creator.platform}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold text-lg">
                  {(creator.creatorName || creator.creatorId)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">
                    {creator.creatorName || creator.creatorId}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="capitalize">{creator.platform}</span>
                    <span>•</span>
                    <span className="text-red-600 font-medium">
                      {creator.credibilityRating.toFixed(1)}/10
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/creator/${encodeURIComponent(creator.creatorId)}?platform=${creator.platform}`
                  )
                }
              >
                {t.viewDetails}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default function NewsPage() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      {/* Main Content Feed */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">{t.trendingOnCheckmate}</h1>
        <AllAnalyses />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 hidden md:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pt-15">
        <TopCredibleSources />
        <TopMisinformationSources />
      </div>
    </div>
  );
}
