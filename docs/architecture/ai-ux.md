# CardIQ AI Copilot & Conversational UX Architecture

## Overview
The AI Copilot is the intelligent conversational layer built on top of CardIQ's deterministic engine. Its primary purpose is to *explain, summarize, and guide* rather than calculate. The architecture enforces this distinction through strict UX patterns.

## Route Architecture (`app/(ai)`)
- **`/copilot`**: The conversational entry point. Features quick prompts and access to recent chat history to facilitate zero-friction engagement.
- **`/chat/[id]`**: The main conversational interface. Supports streaming responses and dynamic Markdown rendering.
- **`/insights`**: A personalized feed where the AI acts proactively, surfacing cap warnings, spending anomalies, and optimization opportunities based on deterministic data.

## Explainability & Trust Framework
To maintain trust and clarify the AI's role, we use specific UX components:
1. **`ConfidenceIndicator`**: Badges (High Confidence, Estimated, Approximation) explicitly tell the user the reliability of the AI's current statement.
2. **`CalculationReferenceCard`**: When the AI explains an optimization, this inline card visually links the generative text back to the specific mathematical rules engine that produced the result.
3. **Disclaimers**: A persistent footer on all chat inputs reminds users that "AI explanations should not be considered financial advice."

## State Management & Local-First Strategy
The conversational experience must feel instantaneous.
- **`useChatStore` (Zustand + Persist)**: We use local storage persistence for conversation history. When a user sends a message, it is instantly added to the local store and rendered. This prevents perceived latency.
- **`useChatStream` (Custom Hook)**: Manages the streaming state (`isStreaming`) and the live accumulation of tokens. It handles the transition from `StreamingMessage` (temporary UI) to `AIMessage` (persisted UI) once the stream closes.

## Streaming UX
- **Typing Indicators**: Visual pulses indicate active generation.
- **Graceful Fallbacks**: If the primary AI provider fails mid-stream or fails to connect, the hook is designed to capture the error and output a fallback message locally, preventing UI lockups.

## Mobile Ergonomics
- The `MessageComposer` uses a dynamic `textarea` with a `min-height` and `max-height` rather than a standard input to handle multi-line prompts elegantly.
- The `ChatWindow` implements an automatic `scrollIntoView` ref on the newest message, which is critical when the mobile virtual keyboard obscures the viewport.
