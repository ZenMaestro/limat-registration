# Lingaya's Group Logo Setup

## Current Status
The application currently uses an **SVG placeholder** of the Lingaya's Group logo with orange (#FF6B35) and yellow (#FFA630) flame gradient colors.

## To Use Your Own Logo

### Option 1: Replace with Your PNG/JPG Logo
1. Save your Lingaya's Group logo as `lingaya-logo.png` in this directory
2. The HTML files are already configured to use both SVG and PNG fallback

### Option 2: Use SVG (Current)
The current SVG flame logo will work as a placeholder until you add your official logo.

## Logo Specifications
- **Format:** PNG, JPG, SVG recommended
- **Dimensions:** Square (1:1 aspect ratio recommended)
- **Background:** Transparent preferred
- **Color Scheme:** Orange (#FF6B35) and Yellow (#FFA630) to match the theme

## File Locations
- Place your logo here: `frontend/assets/img/lingaya-logo.png`

## CSS Styling
All logo references use the class `logo-img` which is styled in `frontend/assets/css/style.css`:

```css
.logo-img {
  height: 50px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
```

Adjust the `height` value in HTML if you need a different size.

---

**For:** LIMAT Semester Registration System - Lingaya's Group
**Color Scheme:** Orange (#FF6B35) + Yellow (#FFA630)
