"use client";

import { useEffect, useState } from "react";

// Occasion configuration type
export type OccasionType = "diwali" | "christmas" | "newyear" | "holi" | "default";

interface OccasionConfig {
  emojis: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animationSpeed: "slow" | "medium" | "fast";
  density: "low" | "medium" | "high";
}

// Occasion configurations
const occasionConfigs: Record<OccasionType, OccasionConfig> = {
  diwali: {
    emojis: ["🪔", "🪔", "✨", "🌟", "💫", "🕯️", "🎆", "🎇", "⭐", "✨"],
    colors: {
      primary: "from-yellow-400/20",
      secondary: "to-orange-500/20",
      accent: "text-yellow-300",
    },
    animationSpeed: "medium",
    density: "high",
  },
  christmas: {
    emojis: ["🎄", "❄️", "⭐", "🎁", "🔔", "❄️", "⭐", "🎄", "✨", "🌟"],
    colors: {
      primary: "from-green-400/20",
      secondary: "to-red-500/20",
      accent: "text-green-300",
    },
    animationSpeed: "slow",
    density: "high",
  },
  newyear: {
    emojis: ["🎉", "🎊", "✨", "🌟", "⭐", "🎈", "🎆", "💫", "✨", "🎉"],
    colors: {
      primary: "from-purple-400/20",
      secondary: "to-pink-500/20",
      accent: "text-purple-300",
    },
    animationSpeed: "fast",
    density: "high",
  },
  holi: {
    emojis: ["🎨", "🌈", "✨", "💫", "🎉", "🌟", "⭐", "✨", "🌈", "🎨"],
    colors: {
      primary: "from-pink-400/20",
      secondary: "to-blue-500/20",
      accent: "text-pink-300",
    },
    animationSpeed: "medium",
    density: "high",
  },
  default: {
    emojis: ["✨", "🌟", "⭐", "💫", "✨"],
    colors: {
      primary: "from-purple-400/20",
      secondary: "to-pink-500/20",
      accent: "text-purple-300",
    },
    animationSpeed: "medium",
    density: "medium",
  },
};

interface OccasionDecorationsProps {
  occasion?: OccasionType;
  enabled?: boolean;
}

export function OccasionDecorations({
  occasion = "default",
  enabled = true,
}: OccasionDecorationsProps) {
  const [decorations, setDecorations] = useState<
    Array<{
      id: number;
      emoji: string;
      left: number;
      top: number;
      delay: number;
      duration: number;
      size: number;
    }>
  >([]);

  useEffect(() => {
    if (!enabled) {
      setDecorations([]);
      return;
    }

    const config = occasionConfigs[occasion];
    const densityMultiplier =
      config.density === "high" ? 25 : config.density === "medium" ? 15 : 10;

    const speedMultiplier =
      config.animationSpeed === "fast" ? 0.8 : config.animationSpeed === "slow" ? 1.5 : 1;

    const newDecorations = Array.from({ length: densityMultiplier }, (_, i) => ({
      id: i,
      emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
      left: Math.random() * 100,
      top: -10 - Math.random() * 20, // Start above viewport
      delay: Math.random() * 3,
      duration: (3 + Math.random() * 4) * speedMultiplier,
      size: 16 + Math.random() * 12, // Random size between 16-28px
    }));

    setDecorations(newDecorations);

    // Continuously add new decorations
    const interval = setInterval(() => {
      setDecorations((prev) => {
        // Remove decorations that have fallen off screen
        const filtered = prev.filter((dec) => dec.top < 110);
        
        // Add new decoration at random intervals
        if (Math.random() > 0.7 && filtered.length < densityMultiplier) {
          const config = occasionConfigs[occasion];
          filtered.push({
            id: Date.now(),
            emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
            left: Math.random() * 100,
            top: -10 - Math.random() * 20,
            delay: 0,
            duration: (3 + Math.random() * 4) * speedMultiplier,
            size: 16 + Math.random() * 12,
          });
        }
        
        return filtered;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [occasion, enabled]);

  if (!enabled || decorations.length === 0) {
    return null;
  }

  const config = occasionConfigs[occasion];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {decorations.map((decoration) => (
        <div
          key={decoration.id}
          className={`absolute ${config.colors.accent} animate-hang-fade`}
          style={{
            left: `${decoration.left}%`,
            top: `${decoration.top}%`,
            fontSize: `${decoration.size}px`,
            animationDelay: `${decoration.delay}s`,
            animationDuration: `${decoration.duration}s`,
            animationFillMode: "forwards",
          }}
        >
          {decoration.emoji}
        </div>
      ))}
    </div>
  );
}

