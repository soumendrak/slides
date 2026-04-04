# Update Prompt for AI Assistant

## Project Overview

**slides.soumendrak.com** - A static site for hosting reveal.js presentations on Cloudflare Pages. This is both a personal talks collection and a reusable template for others.

## Repository Structure

```
slides/
├── index.html              # Homepage: talk directory (dark theme, card-based UI)
├── README.md               # Public documentation with badges, quick start guide
├── LICENSE                 # MIT License (Copyright 2026 Soumendra Kumar Sahoo)
├── CLAUDE.md               # Internal notes for AI assistants
├── _redirects              # Cloudflare Pages config
├── shared/
│   └── assets/images/      # Reusable images (QR codes, logos, soumendra_avatar.webp)
└── talks/
    └── 2026/
        └── iter-claude-limits/
            ├── index.html  # RevealJS slides (~592 lines)
            ├── story.html  # Extended story version
            └── assets/     # Talk-specific images
```

## Tech Stack

- **Framework:** reveal.js 4.3.1 (via CDN)
- **Theme:** night (dark background, consistent across all talks)
- **Styling:** Custom CSS with Tailwind-like color palette (#0f172a, #1e293b, #60a5fa, etc.)
- **Hosting:** Cloudflare Pages
- **Domain:** slides.soumendrak.com
- **Analytics:** Rybbit (rybbit.ekathi.com) with site-id cc520e8c3f89

## Critical Style Guidelines (MUST FOLLOW)

1. **NEVER use em dash (—)** - Use a period, comma, or colon instead
2. **Use sentence case** for slide titles (not Title Case)
3. **Prefer dark theme** (`night`) for all presentations
4. **Link shared assets with absolute paths:** `/shared/assets/images/`
5. **Always add favicon:** Use `soumendra_avatar.webp` (adjust path depth: `shared/assets/...` or `../../shared/assets/...`)
6. **Homepage cards:** Dark theme with #1e293b background, #60a5fa accents

## Adding a New Talk

1. Create folder: `talks/YYYY/talk-slug/`
2. Add `index.html` with reveal.js slides (use existing talks as template)
3. Put talk-specific images in `talks/YYYY/talk-slug/assets/`
4. Add entry to root `index.html` homepage (copy existing talk card pattern)
5. Include analytics script if needed
6. Commit and push (auto-deploys to Cloudflare Pages)

## Reveal.js Template Pattern

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Talk Title</title>
    <link rel="icon" href="../../../shared/assets/images/soumendra_avatar.webp">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reset.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/theme/night.min.css">
    <style>
        /* Custom styles matching existing talks */
        .reveal { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .reveal h1, .reveal h2 { text-transform: none; }
        .highlight-text { color: #facc15; font-weight: 600; }
        .code-block { background: #1e293b; border-left: 3px solid #a78bfa; }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            <section>...</section>
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
    <script>Reveal.initialize();</script>
</body>
</html>
```

## Current Talks

- **2026/iter-claude-limits/**: "Mastering Claude: Limits & Configuration" - April 2026, ITER College
  - Covers Claude AI capabilities, usage limits, configuration strategies
  - Tags: AI, Claude, Productivity

## Common Tasks

**Start local server:**
```bash
python -m http.server 8000
# or: npx serve .
```

**Navigate slides:** Arrow keys/space, `Esc` for overview, `F` for fullscreen, `S` for speaker notes

## Advanced Features Available

- D3.js for data visualizations
- Three.js for 3D graphics  
- GSAP for animations
- PDF export (add `?view=print` to URL)

## Important Notes

- All talks are standalone HTML files
- Homepage (`index.html`) has analytics script in `<head>`
- QR code and reusable assets in `/shared/assets/images/`
- **Never use em dash** - this is enforced strictly
- Keep dark theme consistent across all presentations
