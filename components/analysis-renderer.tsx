import React from "react";

// Component to render markdown-like analysis content in a structured way
export function AnalysisRenderer({ content }: { content: string }) {
  const renderContent = (text: string) => {
    // First, handle major sections with headers
    const sections = text.split(/\*\*([^*]+):\*\*/);
    const result = [];

    for (let i = 0; i < sections.length; i++) {
      if (i === 0 && sections[i].trim()) {
        // First section (before any headers)
        result.push(
          <div key={i} className="prose prose-sm max-w-none">
            {renderParagraphs(sections[i].trim())}
          </div>
        );
      } else if (i % 2 === 1) {
        // Header
        const header = sections[i];
        const content = sections[i + 1] || "";

        result.push(
          <div key={i} className="mb-4">
            <h4 className="font-semibold text-base mb-3 text-primary">
              {header}
            </h4>
            <div className="pl-3 border-l-2 border-border">
              {renderSectionContent(content)}
            </div>
          </div>
        );
        i++; // Skip the content part as we've processed it
      }
    }

    return result.length > 0 ? result : renderParagraphs(text);
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
