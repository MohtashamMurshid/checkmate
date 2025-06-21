import { Id } from "@/convex/_generated/dataModel";
import { AnalysisPage } from "@/components/analyses-content";

export default async function AnalysisPageWrapper({
  params,
}: {
  params: Promise<{ analysis: Id<"tiktokAnalyses"> }>;
}) {
  const { analysis } = await params;
  return <AnalysisPage analysisId={analysis} />;
}
