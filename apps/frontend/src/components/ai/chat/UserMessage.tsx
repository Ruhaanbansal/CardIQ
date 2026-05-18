import React from 'react';

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-4 w-full justify-end">
      <div className="max-w-[80%] bg-muted rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-foreground">
        {content}
      </div>
    </div>
  );
}
