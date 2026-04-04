# Slides.soumendrak.com

[![Made with Reveal.js](https://img.shields.io/badge/Made%20with-Reveal.js-2a9d8f?logo=reveal.js)](https://revealjs.com/)
[![Hosted on Cloudflare Pages](https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-f38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![HTML](https://img.shields.io/badge/HTML-5-e34c26?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A static site template for hosting reveal.js presentations on Cloudflare Pages. This repository serves as both my personal talks collection and a reusable template for others.

## Quick Start

1. **Fork this repository**

2. **Install dependencies** (none required - pure static HTML)

3. **Start local server:**
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

4. **Open** `http://localhost:8000`

## Project Structure

```
slides/
├── index.html              # Homepage: talk directory listing
├── _redirects              # Cloudflare Pages config (optional)
├── shared/
│   └── assets/images/      # Reusable images (QR codes, logos, avatars)
└── talks/
    └── YYYY/
        └── talk-name/
            ├── index.html  # RevealJS slides
            └── assets/     # Talk-specific images
```

## Adding a New Talk

1. **Create folder:**
   ```bash
   mkdir -p talks/YYYY/my-talk-name
   ```

2. **Create `index.html`** with reveal.js slides. Use this template:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Your Talk Title</title>
       <link rel="icon" href="../../shared/assets/images/your-avatar.webp">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reset.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/night.css">
   </head>
   <body>
       <div class="reveal">
           <div class="slides">
               <section>
                   <h1>Slide Title</h1>
                   <p>Content here</p>
               </section>
           </div>
       </div>
       <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
       <script>Reveal.initialize();</script>
   </body>
   </html>
   ```

3. **Add talk-specific images** to `talks/YYYY/my-talk-name/assets/`

4. **Add entry to root `index.html`** homepage (copy and modify existing talk card)

5. **Commit and push** - auto-deploys to Cloudflare Pages (or your chosen host)

## Reveal.js Tips

- **Navigate:** Arrow keys, space, or click
- **Overview mode:** Press `Esc`
- **Fullscreen:** Press `F`
- **Speaker notes:** Press `S`

## Style Guidelines

- Use **sentence case** for slide titles
- Prefer **dark theme** (`night`) for consistency
- Link shared assets with **absolute paths:** `/shared/assets/images/`
- **Never use em dash (—)** - use a period, comma, or colon instead

## Customization

### Change the homepage title/author
Edit the `<title>` and `h1` in `index.html` at repository root.

### Add your own shared assets
Put reusable images in `shared/assets/images/`

### Use a custom domain
1. Add your domain to Cloudflare Pages (or host of choice)
2. Update `_redirects` if needed
3. Update `index.html` favicon paths

### Add analytics
Replace or remove the analytics script in `index.html`:
```html
<script
    src="https://rybbit.ekathi.com/api/script.js"
    data-site-id="your-site-id"
    defer
></script>
```

## Tech Stack

- **[reveal.js](https://revealjs.com/)** 4.3.1 - HTML presentation framework
- **Theme:** night (dark background)
- **Hosting:** Cloudflare Pages (or any static host)

## Advanced Features

The reveal.js setup supports:
- [D3.js](https://d3js.org/) for data visualizations
- [Three.js](https://threejs.org/) for 3D graphics
- [GSAP](https://greensock.com/gsap/) for animations
- Speaker notes (press `S` during presentation)
- PDF export (add `?view=print` to URL)

## License

This repository structure is available for anyone to use for their own presentations. The talk content itself is © the respective authors.

---

**Questions?** Open an issue or check the [reveal.js documentation](https://revealjs.com/).
