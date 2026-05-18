import { useState, useCallback } from 'react';
import { useChatStore } from '../../stores/chatStore';

export function useChatStream(chatId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const addMessage = useChatStore(state => state.addMessage);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessageId = Date.now().toString();
    addMessage(chatId, { id: userMessageId, role: 'user', content, createdAt: Date.now() });

    setIsStreaming(true);
    setStreamContent('');

    try {
      // Simulate streaming latency and chunks for frontend dev
      // In production, this reads from fetch() ReadableStream
      const fakeResponse = `Analyzing your request regarding "${content}".\n\nBased on deterministic calculation models, the Axis ATLAS provides higher base returns for travel, but the HDFC Millennia offers a more consistent 5% across generic e-commerce.\n\n*Note: This is an AI explanation of deterministic rules.*`;
      
      let currentLength = 0;
      const streamInterval = setInterval(() => {
        currentLength += 3;
        if (currentLength >= fakeResponse.length) {
          clearInterval(streamInterval);
          setStreamContent(fakeResponse);
          setIsStreaming(false);
          addMessage(chatId, { id: Date.now().toString(), role: 'assistant', content: fakeResponse, createdAt: Date.now() });
          setStreamContent('');
        } else {
          setStreamContent(fakeResponse.substring(0, currentLength));
        }
      }, 20);

    } catch (error) {
      setIsStreaming(false);
      addMessage(chatId, { id: Date.now().toString(), role: 'assistant', content: 'An error occurred while connecting to the AI provider. Please try again.', createdAt: Date.now() });
    }
  }, [chatId, addMessage]);

  return { sendMessage, isStreaming, streamContent };
}
