// PostHog wrapper (stubbed for now, ready for actual integration)

export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      // e.g., posthog.capture(eventName, properties)
      console.log(`[Analytics Track] ${eventName}`, properties);
    }
  },
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      // e.g., posthog.identify(userId, traits)
      console.log(`[Analytics Identify] ${userId}`, traits);
    }
  },
};

// Strongly typed events
export const Events = {
  CARD_SEARCH: 'card_search',
  COMPARE_CLICK: 'compare_click',
  OPTIMIZER_START: 'optimizer_start',
  SIGNUP_START: 'signup_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;
