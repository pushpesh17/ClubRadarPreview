/**
 * Occasion Configuration
 * 
 * To change the occasion, simply update the `currentOccasion` value below.
 * Available options: "diwali" | "christmas" | "newyear" | "holi" | "default"
 * 
 * You can also set this to "none" to disable decorations entirely.
 */

import { OccasionType } from "@/components/occasion-decorations";

// Change this value to switch occasions
export const currentOccasion: OccasionType | "none" = "default";

// Enable or disable decorations (useful for A/B testing or quick toggling)
export const decorationsEnabled = true;

