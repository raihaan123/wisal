# Font Setup Instructions

## Bierstadt Font

The Wisal platform uses the Bierstadt font as specified in the design requirements. To complete the font setup:

1. **Obtain Bierstadt Font Files**
   - Purchase or obtain licensed copies of:
     - Bierstadt-Regular.woff2
     - Bierstadt-Regular.woff
     - Bierstadt-Bold.woff2
     - Bierstadt-Bold.woff

2. **Place Font Files**
   - Copy the font files to this directory: `/public/fonts/`

3. **Font Fallbacks**
   - The system will automatically fall back to system fonts if Bierstadt is not available
   - Fallback chain: Bierstadt → system-ui → -apple-system → BlinkMacSystemFont → Segoe UI → sans-serif

4. **Alternative Free Fonts**
   If Bierstadt is not available, consider these similar alternatives:
   - Inter (modern, clean geometric sans-serif)
   - Source Sans Pro (humanist sans-serif)
   - Roboto (neutral sans-serif)

5. **Update CSS if Using Alternative**
   If using an alternative font, update the font-face declarations in:
   - `/src/styles/wisal-theme.css`
   - Update the font-family in `tailwind.config.js`

## WCAG Compliance
The chosen font must maintain readability at all sizes to ensure WCAG 2.1 compliance.