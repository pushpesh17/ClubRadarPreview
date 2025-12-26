# Occasion Decorations Guide

## Overview
The occasion decorations component adds beautiful hanging emojis/icons that fade out, perfect for special occasions like Diwali, Christmas, New Year, Holi, etc.

## How to Change Occasions

### Quick Change (Recommended)
Simply edit `/lib/occasion-config.ts`:

```typescript
// Change this line:
export const currentOccasion: OccasionType | "none" = "diwali";

// Available options:
// - "diwali" - Diwali decorations (🪔, ✨, 🎆)
// - "christmas" - Christmas decorations (🎄, ❄️, 🎁)
// - "newyear" - New Year decorations (🎉, 🎊, 🎈)
// - "holi" - Holi decorations (🎨, 🌈, ✨)
// - "default" - Default decorations (✨, 🌟, ⭐)
// - "none" - Disable decorations
```

### Enable/Disable
```typescript
export const decorationsEnabled = true; // Set to false to disable
```

## How It Works

1. **Component Location**: `/components/occasion-decorations.tsx`
2. **Config Location**: `/lib/occasion-config.ts`
3. **Integration**: Already integrated in `/app/layout.tsx` (site-wide)

## Adding New Occasions

To add a new occasion, edit `/components/occasion-decorations.tsx`:

1. Add your occasion type to `OccasionType`:
```typescript
export type OccasionType = "diwali" | "christmas" | "newyear" | "holi" | "your-occasion" | "default";
```

2. Add configuration in `occasionConfigs`:
```typescript
your_occasion: {
  emojis: ["🎉", "✨", "🌟"], // Your emojis
  colors: {
    primary: "from-blue-400/20",
    secondary: "to-green-500/20",
    accent: "text-blue-300",
  },
  animationSpeed: "medium", // "slow" | "medium" | "fast"
  density: "high", // "low" | "medium" | "high"
},
```

## Features

- ✨ Hanging emojis that fall and fade out
- 🎨 Different colors for each occasion
- ⚡ Configurable animation speed
- 📊 Adjustable density (number of decorations)
- 🔄 Continuous animation (new decorations appear automatically)
- 📱 Mobile responsive
- 🎯 Non-intrusive (pointer-events-none, doesn't block clicks)

## Example Usage

### For Diwali:
```typescript
export const currentOccasion: OccasionType | "none" = "diwali";
```

### For Christmas:
```typescript
export const currentOccasion: OccasionType | "none" = "christmas";
```

### To Disable:
```typescript
export const currentOccasion: OccasionType | "none" = "none";
// OR
export const decorationsEnabled = false;
```

## Customization

You can customize:
- **Emojis**: Change the emoji array for any occasion
- **Colors**: Adjust Tailwind color classes
- **Speed**: Change animation speed (slow/medium/fast)
- **Density**: Control how many decorations appear (low/medium/high)

## Notes

- Decorations are fixed position and appear site-wide
- They don't interfere with user interactions
- Performance optimized with automatic cleanup
- Works on all screen sizes

