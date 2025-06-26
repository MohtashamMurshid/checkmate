# Components Directory

This directory contains all reusable UI components for the Checkmate application, organized by functionality and purpose.

## Directory Structure

```
components/
├── analysis/                 # Analysis-related components
│   ├── analysis-card.tsx     # Individual analysis display
│   ├── empty-state.tsx       # Reusable empty state component
│   ├── loading-spinner.tsx   # Consistent loading indicator
│   └── index.ts              # Central exports
├── news/                     # News feed components
│   ├── creator-sources-card.tsx      # Base component for creator lists
│   ├── top-credible-sources.tsx      # Credible sources display
│   ├── top-misinformation-sources.tsx # Misinformation sources display
│   └── index.ts              # Central exports
├── ui/                       # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── ...
│   └── [other ui components]
├── all-analyses.tsx          # Main analyses feed component
├── header.tsx                # Application header
├── footer.tsx                # Application footer
├── hero-section.tsx          # Landing page hero
├── language-provider.tsx     # Internationalization context
├── theme-provider.tsx        # Theme context
└── [other components...]
```

## Component Categories

### 1. Analysis Components (`/analysis`)

Components related to displaying and managing content analysis data.

**Key Components:**

- `AnalysisCard` - Displays individual analysis items
- `LoadingSpinner` - Consistent loading states
- `EmptyState` - Empty state messaging

**Usage:**

```tsx
import { AnalysisCard, LoadingSpinner, EmptyState } from '@/components/analysis';

// Display an analysis
<AnalysisCard analysis={analysisData} />

// Show loading state
<LoadingSpinner message="Loading analyses..." />

// Show empty state
<EmptyState
  title="No analyses"
  description="No analyses found."
/>
```

### 2. News Components (`/news`)

Components for displaying news feeds and creator information.

**Key Components:**

- `CreatorSourcesCard` - Base component for creator lists
- `TopCredibleSources` - Pre-configured credible sources
- `TopMisinformationSources` - Pre-configured misinformation sources

**Usage:**

```tsx
import { TopCredibleSources, TopMisinformationSources } from '@/components/news';

// Display credible sources
<TopCredibleSources limit={5} />

// Display misinformation sources
<TopMisinformationSources limit={5} platform="tiktok" />
```

### 3. UI Components (`/ui`)

Base UI components built with shadcn/ui. These provide consistent styling and behavior across the application.

**Common Components:**

- `Button` - Various button styles and sizes
- `Card` - Container component with consistent styling
- `Badge` - Labels and status indicators
- `Tooltip` - Contextual information
- And many more...

**Usage:**

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline">Click me</Button>
  </CardContent>
</Card>;
```

## Design Principles

### 1. **Modularity**

- Each component has a single responsibility
- Components are composed to create complex UIs
- Easy to test and maintain individually

### 2. **Reusability**

- Components accept props to customize behavior
- Generic components can be configured for different use cases
- Consistent APIs across similar components

### 3. **Type Safety**

- All components use TypeScript interfaces
- Props are well-documented with JSDoc
- Runtime type checking where appropriate

### 4. **Documentation**

- Each component includes JSDoc comments
- Usage examples provided
- Clear prop descriptions

### 5. **Accessibility**

- Components follow WCAG guidelines
- Proper ARIA attributes
- Keyboard navigation support

## Development Guidelines

### Creating New Components

1. **Choose the right location:**

   - Put feature-specific components in appropriate directories
   - Use `/ui` for base/generic components
   - Create new directories for new feature areas

2. **Follow naming conventions:**

   - Use PascalCase for component names
   - Use kebab-case for file names
   - Be descriptive but concise

3. **Structure your component:**

   ```tsx
   /**
    * ComponentName - Brief description
    */

   import React from "react";

   interface ComponentProps {
     /** Prop description */
     propName: string;
   }

   export const ComponentName = ({ propName }: ComponentProps) => {
     return <div>{propName}</div>;
   };
   ```

4. **Add to index.ts:**
   ```tsx
   export { ComponentName } from "./component-name";
   ```

### Best Practices

1. **Use TypeScript strictly:**

   - Define interfaces for all props
   - Avoid `any` types
   - Use generic types where appropriate

2. **Document thoroughly:**

   - Add JSDoc comments
   - Include usage examples
   - Document all props

3. **Keep components focused:**

   - Single responsibility principle
   - Compose complex UIs from simple components
   - Avoid large, monolithic components

4. **Handle loading and error states:**

   - Use consistent loading spinners
   - Provide meaningful error messages
   - Graceful degradation

5. **Make components accessible:**
   - Use semantic HTML
   - Add proper ARIA attributes
   - Support keyboard navigation

## Testing

Components should be tested to ensure they:

- Render correctly with different props
- Handle edge cases gracefully
- Meet accessibility standards
- Maintain consistent behavior

## Performance Considerations

- Use `React.memo()` for components that re-render frequently
- Implement proper key props for lists
- Consider code splitting for large components
- Optimize bundle size with tree shaking

## Future Improvements

- Add Storybook for component documentation
- Implement visual regression testing
- Add more comprehensive accessibility testing
- Create design system tokens for consistent styling

For more detailed information about the refactoring process, see [REFACTORING_GUIDE.md](../docs/REFACTORING_GUIDE.md).
