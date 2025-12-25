# 🎨 Custom Favicon Setup Guide

## Quick Steps

### Option 1: Simple Replacement (Easiest)

1. **Create your favicon** (16x16, 32x32, or 48x48 pixels, .ico format)
2. **Replace the existing file**: `app/favicon.ico`
3. **Done!** Next.js will automatically use it

### Option 2: Modern Approach (Recommended)

Next.js 13+ supports multiple icon formats automatically. Place these files in the `app/` directory:

#### Required Files:

- `icon.png` or `icon.svg` - Main favicon (any size, Next.js will optimize)
- `apple-icon.png` - For Apple devices (180x180px recommended)

#### Optional Files:

- `icon-192.png` - For Android (192x192px)
- `icon-512.png` - For Android (512x512px)

## Step-by-Step Instructions

### Step 1: Prepare Your Icon

1. **Design your favicon** with your ClubRadar logo/brand
2. **Recommended sizes:**
   - Main icon: 32x32px, 64x64px, or 128x128px
   - Apple icon: 180x180px
   - Android icons: 192x192px and 512x512px

### Step 2: Convert to Required Formats

#### For PNG/SVG (Modern):

- Save as `icon.png` or `icon.svg` in the `app/` directory
- Save as `apple-icon.png` (180x180px) in the `app/` directory

#### For ICO (Traditional):

- Use an online converter (like https://favicon.io/favicon-converter/)
- Save as `favicon.ico` in the `app/` directory

### Step 3: Place Files in App Directory

```
clubradar/
  app/
    favicon.ico          (optional - for older browsers)
    icon.png             (or icon.svg)
    apple-icon.png       (for iOS devices)
    icon-192.png         (optional - for Android)
    icon-512.png         (optional - for Android)
```

### Step 4: Update Metadata (Optional)

You can also configure icons in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};
```

## File Formats Explained

### favicon.ico

- **Format**: ICO
- **Size**: 16x16, 32x32, or 48x48 pixels
- **Use**: Traditional favicon, works everywhere
- **Location**: `app/favicon.ico`

### icon.png / icon.svg

- **Format**: PNG or SVG
- **Size**: Any size (Next.js optimizes automatically)
- **Use**: Modern browsers, automatically detected
- **Location**: `app/icon.png` or `app/icon.svg`

### apple-icon.png

- **Format**: PNG
- **Size**: 180x180px (recommended)
- **Use**: iOS devices (home screen icon)
- **Location**: `app/apple-icon.png`

## Tools for Creating Favicons

### Online Tools:

1. **Favicon.io** - https://favicon.io/

   - Upload image → Generate all sizes
   - Free, easy to use

2. **RealFaviconGenerator** - https://realfavicongenerator.net/

   - Comprehensive favicon generator
   - Generates all formats and sizes

3. **Favicon Generator** - https://www.favicon-generator.org/
   - Simple and fast

### Design Tips:

- Keep it simple (small icons need clarity)
- Use high contrast colors
- Test at 16x16 and 32x32 sizes
- Avoid fine details (they won't show at small sizes)
- Use your brand colors

## Current Setup

Your current favicon is located at:

- `app/favicon.ico`

## Quick Start (Recommended)

1. **Create your icon** (PNG, 512x512px recommended)
2. **Use Favicon.io** to generate all formats:
   - Upload your 512x512px image
   - Download the generated files
3. **Place files in `app/` directory:**
   - `favicon.ico`
   - `icon.png` (or `icon.svg`)
   - `apple-icon.png`
4. **Test**: Clear browser cache and reload

## Testing Your Favicon

1. **Clear browser cache** (important!)
2. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check browser tab** - you should see your new favicon
4. **Test on mobile** - check iOS home screen icon

## Troubleshooting

### Favicon not showing?

1. **Clear browser cache** - This is the #1 issue!
2. **Check file location** - Must be in `app/` directory
3. **Check file name** - Must be exactly `favicon.ico`, `icon.png`, etc.
4. **Restart dev server** - `npm run dev`
5. **Check file format** - Ensure correct format (.ico, .png, .svg)

### Still not working?

- Try incognito/private browsing mode
- Check browser console for errors
- Verify file permissions

## Example File Structure

```
clubradar/
  app/
    favicon.ico          ← Traditional favicon
    icon.png             ← Modern favicon (auto-detected)
    apple-icon.png       ← iOS icon (auto-detected)
    layout.tsx           ← Root layout
    ...
```

## Next.js Automatic Detection

Next.js 13+ automatically detects these files:

- `favicon.ico` - Traditional favicon
- `icon.png` / `icon.svg` - Modern favicon
- `apple-icon.png` - Apple touch icon
- `icon-*.png` - Android icons

**No configuration needed!** Just place the files in `app/` directory.

## Production Deployment

After adding your favicon:

1. **Test locally** - Make sure it works
2. **Deploy to Vercel** - Files will be included automatically
3. **Clear CDN cache** (if using Vercel, it's automatic)

---

**Need help?** Check Next.js docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
