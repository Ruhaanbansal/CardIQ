import { AppShell } from '@/components/layout/AppShell';
import { ChatWindow } from '@/components/ai/chat/ChatWindow';
import { MessageComposer } from '@/components/ai/chat/MessageComposer';

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b bg-background z-10">
          <h2 className="text-lg font-semibold truncate">Analysis Session</h2>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
           <ChatWindow chatId={id} />
        </div>
        
        {/* Input Area */}
        <div className="pt-4 pb-2 bg-background z-10">
          <MessageComposer chatId={id} />
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            AI explanations should not be considered financial advice. Verify important details.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
