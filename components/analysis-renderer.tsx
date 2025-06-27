import React from "react";

/**
 * AnalysisRenderer - Enhanced component to render markdown-like analysis content
 *
 * Supported heading formats:
 * - # Heading 1 (h1 - text-2xl)
 * - ## Heading 2 (h2 - text-xl)
 * - ### Heading 3 (h3 - text-lg)
 * - #### Heading 4 (h4 - text-base)
 * - ##### Heading 5 (h5 - text-sm font-medium)
 * - ###### Heading 6 (h6 - text-sm)
 * - **Legacy Header:** (converted to h3)
 *
 * Also supports:
 * - **Bold text**
 * - *Italic text*
 * - `Code snippets`
 * - [Links](https://example.com)
 * - - Bullet points
 * - - **Sub-headers:** with content
 */
export function AnalysisRenderer({ content }: { content: string }) {
  // Guard against null, undefined, or empty content
  if (!content || typeof content !== "string" || content.trim() === "") {
    return null;
  }

  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const elements = [];
    let currentSection = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check for markdown-style headers (# ## ### etc.)
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        // Process any accumulated content before this header
        if (currentSection.length > 0) {
          elements.push(
            <div key={`section-${i}`} className="mb-4">
              {renderSectionContent(currentSection.join("\n"))}
            </div>
          );
          currentSection = [];
        }

        // Render the header
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];
        elements.push(renderHeader(headerText, level, `header-${i}`));
        continue;
      }

      // Check for legacy **Header:** format
      const legacyHeaderMatch = trimmedLine.match(/^\*\*([^*]+):\*\*$/);
      if (legacyHeaderMatch) {
        // Process any accumulated content before this header
        if (currentSection.length > 0) {
          elements.push(
            <div key={`section-${i}`} className="mb-4">
              {renderSectionContent(currentSection.join("\n"))}
            </div>
          );
          currentSection = [];
        }

        // Render as h3 by default for legacy format
        elements.push(
          renderHeader(legacyHeaderMatch[1], 3, `legacy-header-${i}`)
        );
        continue;
      }

      // Accumulate regular content
      currentSection.push(line);
    }

    // Process any remaining content
    if (currentSection.length > 0) {
      elements.push(
        <div key="final-section" className="mb-4">
          {renderSectionContent(currentSection.join("\n"))}
        </div>
      );
    }

    return elements.length > 0 ? elements : renderParagraphs(text);
  };

  const renderHeader = (text: string, level: number, key: string) => {
    const baseClasses = "font-semibold mb-3 text-foreground";
    const levelClasses: Record<number, string> = {
      1: "text-2xl", // h1
      2: "text-xl", // h2
      3: "text-lg", // h3
      4: "text-base", // h4
      5: "text-sm font-medium", // h5
      6: "text-sm", // h6
    };

    const className = `${baseClasses} ${levelClasses[level] || levelClasses[4]}`;

    switch (level) {
      case 1:
        return (
          <h1 key={key} className={className}>
            {text}
          </h1>
        );
      case 2:
        return (
          <h2 key={key} className={className}>
            {text}
          </h2>
        );
      case 3:
        return (
          <h3 key={key} className={className}>
            {text}
          </h3>
        );
      case 4:
        return (
          <h4 key={key} className={className}>
            {text}
          </h4>
        );
      case 5:
        return (
          <h5 key={key} className={className}>
            {text}
          </h5>
        );
      case 6:
        return (
          <h6 key={key} className={className}>
            {text}
          </h6>
        );
      default:
        return (
          <h4 key={key} className={className}>
            {text}
          </h4>
        );
    }
  };

  const renderSectionContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("- **") && line.includes(":**")) {
        // Sub-header with content
        const match = line.match(/- \*\*([^*]+):\*\*(.*)/);
        if (match) {
          elements.push(
            <div key={i} className="mb-3">
              <h5 className="font-medium text-sm mb-1 text-foreground">
                {match[1]}
              </h5>
              <div className="pl-3">{renderText(match[2])}</div>
            </div>
          );
        }
      } else if (line.startsWith("- ")) {
        // Regular bullet point
        elements.push(
          <div key={i} className="flex items-start gap-2 mb-2">
            <span className="text-primary mt-1 text-xs">•</span>
            <div className="flex-1 text-sm leading-relaxed">
              {renderText(line.substring(2))}
            </div>
          </div>
        );
      } else if (line.trim()) {
        // Regular paragraph
        elements.push(
          <div key={i} className="mb-2 text-sm leading-relaxed">
            {renderText(line)}
          </div>
        );
      }
    }

    return elements;
  };

  const renderParagraphs = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
    if (paragraphs.length <= 1) {
      return renderText(text);
    }

    return paragraphs.map((paragraph, index) => (
      <div key={index} className="mb-3 last:mb-0">
        {renderText(paragraph.trim())}
      </div>
    ));
  };

  const renderText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const remaining = text;
    let keyCounter = 0;

    // Combined regex for all inline elements
    const markdownRegex =
      /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = markdownRegex.exec(remaining)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      const fullMatch = match[1];
      const boldText = match[2];
      const italicText = match[3];
      const codeText = match[4];
      const linkText = match[5];
      const linkUrl = match[6];

      if (boldText) {
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold">
            {boldText}
          </strong>
        );
      } else if (italicText) {
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {italicText}
          </em>
        );
      } else if (codeText) {
        parts.push(
          <code
            key={`code-${keyCounter++}`}
            className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-muted-foreground"
          >
            {codeText}
          </code>
        );
      } else if (linkText && linkUrl) {
        parts.push(
          <a
            key={`link-${keyCounter++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline font-medium"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className="space-y-4">{renderContent(content)}</div>;
}
