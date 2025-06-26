import { SignUp } from "@clerk/nextjs";
import { SearchCheck } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SearchCheck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">Checkmate</span>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
