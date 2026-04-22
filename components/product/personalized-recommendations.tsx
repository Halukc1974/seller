"use client";

import { RecommendationSection } from "@/components/product/recommendation-section";

/**
 * Client wrapper that renders a personalized section on the homepage.
 * The API will return personalized results when the user is logged in,
 * or trending products for anonymous visitors.
 */
export function PersonalizedRecommendations() {
  return (
    <RecommendationSection
      title="Recommended for You"
      type="personalized"
      limit={6}
    />
  );
}
