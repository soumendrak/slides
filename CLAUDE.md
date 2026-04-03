# Slides.soumendrak.com

A static site for hosting revealJS presentations.

## Project Structure

```
slides/
├── index.html              # Homepage: talk directory
├── CLAUDE.md               # This file
├── _redirects              # Cloudflare Pages config
├── shared/
│   └── assets/images/      # Reusable images (QR codes, logos)
└── talks/
    └── YYYY/
        └── talk-name/
            ├── index.html  # RevealJS slides
            └── assets/     # Talk-specific images
```

## Adding a New Talk

1. Create folder: `talks/YYYY/talk-slug/`
2. Add `index.html` with revealJS slides
3. Put images in `talks/YYYY/talk-slug/assets/`
4. Add entry to root `index.html` homepage
5. Commit and push (auto-deploys to Cloudflare Pages)

## Style Guidelines

- **Never use em dash (—)**. Use a period, comma, or colon instead.
- Use sentence case for slide titles
- Prefer dark theme (`night`) for consistency
- Link shared assets with absolute paths: `/shared/assets/images/`
- **Add favicon** using `soumendra_avatar.webp`: `<link rel="icon" href="shared/assets/images/soumendra_avatar.webp">` (adjust path depth as needed for nested files)

## Tech Stack

- **Framework:** reveal.js 4.3.1 (via CDN)
- **Theme:** night (dark background)
- **Hosting:** Cloudflare Pages
- **Domain:** slides.soumendrak.com

## Common Tasks

**Start local server:**
```bash
python -m http.server 8000
```

**Navigate slides:**
- Arrow keys or space to move
- `Esc` for overview mode
- `F` for fullscreen

## Notes

- All talks are standalone HTML files
- D3.js, Three.js, GSAP supported for animations
- QR code and other reusable assets in `/shared/assets/images/`
