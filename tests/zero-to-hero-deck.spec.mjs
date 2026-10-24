// The zero-to-hero deck is written in Markdown and draws ```mermaid blocks with Pele, all
// from local files. This checks it renders fully, over http and file://, with no network
// and no page or console errors.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
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
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    page.on('console', message => message.type() === 'error' && pageErrors.push(message.text()));
    await page.goto(url);
    await page.waitForFunction(() => window.Reveal?.isReady());
    const deckState = await page.evaluate(() => ({
      notesPlugin: Reveal.hasPlugin('notes'),
      slides: Reveal.getTotalSlides(),
      withNotes: Reveal.getSlides().filter(slide => Reveal.getSlideNotes(slide)?.trim()).length,
      diagrams: document.querySelectorAll('.pele-diagram svg').length,
      errors: document.querySelectorAll('.pele-error').length,
      titles: Reveal.getSlides().map(slide => slide.querySelector('h2')?.textContent.trim()),
      recaps: [...document.querySelectorAll('.reveal .slides section.recap-slide')].map(slide => slide.querySelector('h2')?.textContent.trim()),
    }));
    const { recaps, titles, ...counts } = deckState;
    // One recap closes each part, in order.
    expect(recaps).toEqual([1, 2, 3, 4, 5, 6].map(n => `Where we are: Part ${n} of 6`));
    const after = (title, next) => expect(titles[titles.indexOf(title) + 1]).toBe(next);
    after('Token budget', 'Cost per run');
    after('Production checklist (2/2)', 'Minimum setup for a small team');
    after('Minimum setup for a small team', 'Instrumentation overhead and load testing');
    expect(titles.indexOf('Appendix: an agent that acted')).toBeGreaterThan(titles.indexOf('Appendix'));
    expect(titles).not.toContain('Why it matters: an agent that acted');
    expect(titles).not.toContain('Buffer C');
    expect(counts).toEqual({ notesPlugin: true, slides: 79, withNotes: 79, diagrams: 3, errors: 0 });
    expect(external).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test('zero-to-hero schedule in the notes is consistent and sums to 180 minutes', () => {
  const html = fs.readFileSync(path.resolve(import.meta.dirname, '..', deck), 'utf8');
  const minutes = hhmm => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
  const agenda = html.match(/- Agenda: (.+)\./)[1].split(', ').map(item => Number(item.match(/(\d+)( min)?$/)[1]));
  expect(agenda.reduce((a, b) => a + b, 0)).toBe(180);

  const chapters = [...html.matchAll(/^## Part (\d): .*\n\n(\d\d:\d\d) to (\d\d:\d\d)/gm)]
    .map(([, n, from, to]) => ({ n: Number(n), from: minutes(from), to: minutes(to) }));
  expect(chapters.map(c => c.n)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(chapters[0].from).toBe(0);
  expect(chapters.at(-1).to).toBe(180);
  for (const [a, b] of chapters.slice(1).map((c, i) => [chapters[i], c])) {
    expect(b.from).toBeGreaterThanOrEqual(a.to);
  }

  const blocks = new Map();
  for (const [, n, from, to] of html.matchAll(/Block (\d+) \((\d\d:\d\d) to (\d\d:\d\d)\)/g)) {
    const span = blocks.get(Number(n)) ?? { from: Infinity, to: 0 };
    blocks.set(Number(n), { from: Math.min(span.from, minutes(from)), to: Math.max(span.to, minutes(to)) });
  }
  const timed = [...blocks.entries()].sort(([a], [b]) => a - b);
  for (const [[, a], [, b]] of timed.slice(1).map((entry, i) => [timed[i], entry])) {
    expect(b.from).toBeGreaterThanOrEqual(a.from);
  }
  expect(blocks.get(1).from).toBe(0);
  expect(blocks.get(36).to).toBe(180);
  expect(blocks.get(33).to).toBe(chapters[5].from);
  expect(blocks.get(34).from).toBe(chapters[5].from);
  expect(chapters[4].to).toBe(chapters[5].from);
});
