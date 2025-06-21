"use client";

import { AllAnalyses } from "@/components/all-analyses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

const TopCredibleSources = () => (
  <Card className="">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <CheckCircle className="h-5 w-5 " />
        Top Credible Sources
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[
        { name: "Reuters", handle: "@Reuters" },
        { name: "Associated Press", handle: "@AP" },
        { name: "BBC News", handle: "@BBCNews" },
      ].map((source) => (
        <div key={source.handle} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
              {source.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{source.name}</p>
              <p className="text-sm text-muted-foreground">{source.handle}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Follow
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
);

const TopMisinformationSources = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <XCircle className="h-5 w-5 " />
        Top Misinformation Sources
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[
        { name: "InfoWars", handle: "@InfoWars" },
        { name: "Breitbart", handle: "@BreitbartNews" },
        { name: "Natural News", handle: "@NaturalNews" },
      ].map((source) => (
        <div key={source.handle} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold text-lg">
              {source.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{source.name}</p>
              <p className="text-sm text-muted-foreground">{source.handle}</p>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function NewsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      {/* Main Content Feed */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Home</CardTitle>
          </CardHeader>
          <CardContent>
            {/* This could be a "What's happening?" input */}
            <div className="border-b pb-4">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-lg"
                placeholder="What's happening?"
              />
              <div className="flex justify-end">
                <Button>Post</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <AllAnalyses />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <TopCredibleSources />
        <TopMisinformationSources />
      </div>
    </div>
  );
}
