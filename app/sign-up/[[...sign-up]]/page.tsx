import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {/* Import lucide-react's SearchCheck icon at the top of the file */}
            {/* <SearchCheck className="h-6 w-6" /> */}
            {/* Since we can't import here, you should add: import { SearchCheck } from "lucide-react"; at the top */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold">Checkmate</span>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
