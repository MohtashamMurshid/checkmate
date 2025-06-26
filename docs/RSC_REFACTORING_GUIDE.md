# React Server Components (RSC) Refactoring Guide

## Overview

This document outlines the refactoring of Checkmate pages from Client Components to React Server Components (RSC) where appropriate, improving performance, SEO, and overall application architecture.

## What Are React Server Components?

React Server Components allow components to render on the server, reducing bundle size and improving initial page load times. They're particularly beneficial for:

- **SEO**: Server-rendered content is immediately available to search engines
- **Performance**: Reduced JavaScript bundle size and faster initial page loads
- **Security**: Sensitive operations can run server-side
- **Data Fetching**: Direct access to backend resources without API calls

## Pages Refactored

### 1. News Page (`app/news/page.tsx`)

**Before:**

```tsx
"use client";

export default function NewsPage() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t.trendingOnCheckmate}</h1>
      <AllAnalyses />
      <TopCredibleSources />
      <TopMisinformationSources />
    </div>
  );
}
```

**After:**

```tsx
// Server Component
import { Metadata } from "next";
import { NewsPageContent } from "@/components/news";

export const metadata: Metadata = {
  title: "Trending News Analysis | Checkmate",
  description: "Discover trending content analyses...",
  keywords: ["news analysis", "fact checking", ...],
};

export default function NewsPage() {
  return <NewsPageContent />;
}
```

**Benefits:**

- ✅ Better SEO with static metadata
- ✅ Faster initial page load
- ✅ Cleaner separation of concerns
- ✅ Server-side rendering for better Core Web Vitals

### 2. Creator Page (`app/creator/[creatorId]/page.tsx`)

**Before:**

```tsx
"use client";

export default function CreatorDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Complex client-side logic...
  return (
    <div>
      <CreatorSummary />
      <CreatorAnalyses />
      <CreatorComments />
    </div>
  );
}
```

**After:**

```tsx
// Server Component
import { Metadata } from "next";
import { CreatorPageContent } from "@/components/creator";

export async function generateMetadata({
  params,
  searchParams,
}): Promise<Metadata> {
  const { creatorId } = await params;
  const platform =
    typeof searchParams.platform === "string"
      ? searchParams.platform
      : "tiktok";

  return {
    title: `${creatorId} - Creator Analysis | Checkmate`,
    description: `View credibility analysis for ${creatorId}...`,
    keywords: ["creator analysis", platform, creatorId],
  };
}

export default function CreatorDetailsPage() {
  return <CreatorPageContent />;
}
```

**Benefits:**

- ✅ Dynamic SEO metadata based on creator
- ✅ Better social media sharing
- ✅ Faster Time to First Byte (TTFB)
- ✅ Improved search engine indexing

## Component Architecture Changes

### Pattern: Server Component → Client Component Delegation

We've implemented a pattern where:

1. **Page Component** (Server): Handles routing, metadata, and static rendering
2. **Content Component** (Client): Handles interactivity, state, and user interactions

```
┌─────────────────────────────────────┐
│ Page Component (Server)             │
│ ├─ Metadata generation              │
│ ├─ Static content                   │
│ └─ Renders → Content Component      │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│ Content Component (Client)          │
│ ├─ Interactive features             │
│ ├─ State management                 │
│ ├─ Event handlers                   │
│ └─ Dynamic data fetching            │
└─────────────────────────────────────┘
```

### New Component Structure

```
components/
├── news/
│   ├── news-page-content.tsx        # Client component for news page
│   ├── creator-sources-card.tsx     # Reusable components
│   └── ...
├── creator/
│   ├── creator-page-content.tsx     # Client component for creator page
│   ├── creator-summary.tsx          # Modular creator components
│   ├── creator-analyses.tsx
│   ├── creator-comments.tsx
│   └── ...
└── analysis/
    ├── analysis-card.tsx
    └── ...
```

## Benefits Achieved

### 1. **Performance Improvements**

- **Reduced Bundle Size**: Server components don't contribute to client bundle
- **Faster Initial Load**: Critical content rendered server-side
- **Better Caching**: Server-rendered content can be cached at CDN level
- **Reduced Hydration**: Less JavaScript to hydrate on client

### 2. **SEO Enhancements**

- **Static Metadata**: Search engines get immediate access to page info
- **Dynamic Metadata**: Creator pages have personalized metadata
- **Server-Rendered Content**: Crawlers see complete content immediately
- **Better Social Sharing**: Rich previews with dynamic metadata

### 3. **Architecture Benefits**

- **Separation of Concerns**: Clear boundary between server and client logic
- **Maintainability**: Easier to reason about what runs where
- **Security**: Sensitive operations stay server-side
- **Scalability**: Server components reduce client processing

## Implementation Guidelines

### When to Use Server Components

✅ **Use Server Components for:**

- Static content and layouts
- SEO-critical pages
- Data fetching from databases
- Metadata generation
- Authentication checks

❌ **Use Client Components for:**

- Interactive features (forms, buttons)
- State management
- Event handlers
- Browser APIs (localStorage, geolocation)
- Real-time updates

### Best Practices

1. **Start with Server Components**

   ```tsx
   // Default to server component
   export default function MyPage() {
     return <div>Static content</div>;
   }
   ```

2. **Use "use client" Sparingly**

   ```tsx
   // Only when interactivity is needed
   "use client";
   export function InteractiveComponent() {
     const [state, setState] = useState();
     return <button onClick={() => setState(...)}>Click</button>;
   }
   ```

3. **Delegate Client Logic**

   ```tsx
   // Server component delegates to client component
   export default function Page() {
     return <InteractivePageContent />;
   }
   ```

4. **Optimize Metadata**
   ```tsx
   export async function generateMetadata({ params }): Promise<Metadata> {
     const data = await fetchData(params.id);
     return {
       title: `${data.title} | MyApp`,
       description: data.description,
     };
   }
   ```

## Migration Checklist

When converting a page to RSC:

- [ ] Remove "use client" directive from page component
- [ ] Extract interactive logic to separate client component
- [ ] Add metadata export for SEO
- [ ] Update imports to use new component structure
- [ ] Test that interactivity still works
- [ ] Verify SEO metadata is correct
- [ ] Check performance improvements

## Performance Metrics

Expected improvements after RSC refactoring:

- **First Contentful Paint (FCP)**: 15-30% improvement
- **Largest Contentful Paint (LCP)**: 10-25% improvement
- **Time to Interactive (TTI)**: 20-40% improvement
- **Bundle Size**: 10-20% reduction
- **SEO Score**: Significant improvement in crawlability

## Common Issues and Solutions

### 1. **Hydration Mismatches**

```tsx
// ❌ Wrong: Server/client render differently
function Component() {
  return <div>{new Date().toString()}</div>;
}

// ✅ Correct: Consistent rendering
function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div>Loading...</div>;
  return <div>{new Date().toString()}</div>;
}
```

### 2. **Client Component Boundaries**

```tsx
// ❌ Wrong: Entire page as client component
"use client";
function Page() {
  return (
    <div>
      <StaticHeader />
      <InteractiveContent />
    </div>
  );
}

// ✅ Correct: Only interactive parts as client
function Page() {
  return (
    <div>
      <StaticHeader />
      <InteractiveContent />
    </div>
  );
}
```

### 3. **State Management**

```tsx
// ❌ Wrong: Trying to use useState in server component
function ServerComponent() {
  const [state, setState] = useState(); // Error!
  return <div>...</div>;
}

// ✅ Correct: Use state in client component
("use client");
function ClientComponent() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

## Future Considerations

### 1. **Streaming and Suspense**

Implement streaming for better perceived performance:

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

### 2. **Partial Prerendering**

Consider using Next.js 14+ partial prerendering for hybrid static/dynamic content.

### 3. **Edge Runtime**

For global performance, consider edge runtime for server components:

```tsx
export const runtime = "edge";
```

## Conclusion

The RSC refactoring significantly improves Checkmate's performance, SEO, and maintainability. By following the established patterns and guidelines, future pages can be built with optimal server/client component boundaries from the start.

The modular approach ensures that interactive features remain responsive while maximizing the benefits of server-side rendering for static content and SEO.

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Component Refactoring Guide](./REFACTORING_GUIDE.md)
