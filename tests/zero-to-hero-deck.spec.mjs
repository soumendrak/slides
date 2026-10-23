// The zero-to-hero deck is written in Markdown and draws ```mermaid blocks with Pele, all
// from local files. This checks it renders fully, over http and file://, with no network.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const deck = 'talks/2026/zero-to-hero-agent-observability/index.html';
const urls = {
  http: `http://127.0.0.1:4173/${deck}`,
  file: pathToFileURL(path.resolve(import.meta.dirname, '..', deck)).href,
};

for (const [scheme, url] of Object.entries(urls)) {
  test(`zero-to-hero deck renders every slide, note and diagram offline over ${scheme}`, async ({ page }) => {
    const external = [];
    await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173\/)/, route => {
      external.push(route.request().url());
      return route.abort();
    });
    await page.goto(url);
    await page.waitForFunction(() => window.Reveal?.isReady());
    const deckState = await page.evaluate(() => ({
      slides: Reveal.getTotalSlides(),
      withNotes: Reveal.getSlides().filter(slide => Reveal.getSlideNotes(slide)?.trim()).length,
      diagrams: document.querySelectorAll('.pele-diagram svg').length,
      errors: document.querySelectorAll('.pele-error').length,
    }));
    expect(deckState).toEqual({ slides: 71, withNotes: 71, diagrams: 3, errors: 0 });
    expect(external).toEqual([]);
  });
}
