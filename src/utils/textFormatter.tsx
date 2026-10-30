import React from 'react';

/**
 * Parses markdown bold syntax (**text**) and renders semantic <strong> tags.
 * Preserves clean text when no markdown formatting exists.
 */
export function renderFormattedText(text: string | undefined | null): React.ReactNode {
  if (!text) return null;
  if (!text.includes('**')) return text;

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white light-theme:text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

