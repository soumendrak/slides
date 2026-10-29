// The zero-to-hero deck is written in Markdown and draws ```mermaid blocks with Pele, all
// from local files. This checks it renders fully, over http and file://, with no network
// and no page or console errors.
import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
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
    after('Why most alerts are false', 'Demo: create the alert');
    after('Which check catches which case?', 'pass@k vs pass^k');
    after('The loop, again', 'Turn the incident into a test');
    after('What we didn\'t cover', 'Homework and Q&A');
    expect(titles).not.toContain('Token budget');
    expect(titles).not.toContain('Why tails matter for agents');
    after('Production checklist (2/2)', 'Minimum setup for a small team');
    after('Minimum setup for a small team', 'Instrumentation overhead and load testing');
    expect(titles.indexOf('Appendix: an agent that acted')).toBeGreaterThan(titles.indexOf('Appendix'));
    expect(titles).not.toContain('Why it matters: an agent that acted');
    expect(titles).not.toContain('Buffer C');
    expect(counts).toEqual({ notesPlugin: true, slides: 80, withNotes: 80, diagrams: 3, errors: 0 });
    expect(external).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test('zero-to-hero schedule in the notes is consistent and sums to 180 minutes', () => {
  const html = fs.readFileSync(path.resolve(import.meta.dirname, '..', deck), 'utf8');
  const minutes = hhmm => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
  const agenda = html.match(/- Agenda: (.+)\./)[1].split(', ').map(item => Number(item.match(/(\d+)( min)?$/)[1]));
  expect(agenda).toHaveLength(8);
  expect(agenda.reduce((a, b) => a + b, 0)).toBe(180);
  const [opening, concepts, incident, pause, evaluator, alerts, production, buffers] = agenda;

  // Part 1's chapter slide shows no time line; it is the opening block from 00:00.
  const chapters = [{ n: 1, from: 0, to: opening }, ...[...html.matchAll(/^## Part (\d): .*\n\n(\d\d:\d\d) to (\d\d:\d\d)/gm)]
    .map(([, n, from, to]) => ({ n: Number(n), from: minutes(from), to: minutes(to) }))];
  expect(chapters.map(c => c.n)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(chapters.map(c => c.to - c.from)).toEqual([opening, concepts, incident, evaluator, alerts, production]);
  expect(chapters[0].from).toBe(0);
  expect(chapters.at(-1).to).toBe(180);
  const gaps = chapters.slice(1).map((c, i) => c.from - chapters[i].to);
  expect(gaps).toEqual([0, 0, pause + buffers / 2, buffers / 2, 0]);

  const blocks = new Map();
  for (const [, n, from, to] of html.matchAll(/Block (\d+)(?: demo)? \((\d\d:\d\d) to (\d\d:\d\d)\)/g)) {
    const span = blocks.get(Number(n)) ?? { from: Infinity, to: 0 };
    blocks.set(Number(n), { from: Math.min(span.from, minutes(from)), to: Math.max(span.to, minutes(to)) });
  }
  const measured = [1, 2, 3, 4, 5, 6, 8, 9, 10, 13, 14, 15, 17, 18, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
  expect([...blocks.keys()].sort((a, b) => a - b)).toEqual(measured);
  const slot = 5;
  for (const [a, b] of measured.slice(1).map((n, i) => [measured[i], n])) {
    expect(blocks.get(b).from - blocks.get(a).to).toBe((b - a - 1) * slot);
  }
  for (const chapter of chapters) {
    const inside = measured.filter(n => blocks.get(n).from >= chapter.from && blocks.get(n).to <= chapter.to);
    expect(blocks.get(inside[0]).from).toBe(chapter.from);
    expect(blocks.get(inside.at(-1)).to).toBe(chapter.to);
  }
  expect(blocks.get(1).from).toBe(0);
  expect(blocks.get(36).to).toBe(180);

  const split = [...html.match(/Block 34 \(02:39 to 02:50\)[^\n]*\n((?:    - [^\n]*\n)+)/)[1]
    .matchAll(/, (\d\d:\d\d) to (\d\d:\d\d)\n/g)].map(([, from, to]) => ({ from: minutes(from), to: minutes(to) }));
  expect(split).toHaveLength(3);
  expect(split[0].from).toBe(blocks.get(34).from);
  expect(split[1].from).toBe(split[0].to);
  expect(split[2].from).toBe(split[1].to);
  expect(split[2].to).toBe(blocks.get(34).to);
  expect(split.reduce((sum, part) => sum + part.to - part.from, 0)).toBe(blocks.get(34).to - blocks.get(34).from);
  const whole = blocks.get(34);
  for (const [, from, to] of html.matchAll(/Block 34 \((\d\d:\d\d) to (\d\d:\d\d)\)/g)) {
    const range = { from: minutes(from), to: minutes(to) };
    const isWhole = range.from === whole.from && range.to === whole.to;
    expect(isWhole || split.some(part => part.from === range.from && part.to === range.to)).toBe(true);
  }
});

const qrFile = path.resolve(import.meta.dirname, '..', path.dirname(deck), 'assets/slides-qr.svg');
const qrSha256 = 'b88e19a2fd3ec5871bd91e6e20524ecf97422681c3f7ad5ca83c8d6e32c3c936';

test('zero-to-hero slide 5 QR file is the pinned one (error correction H, encodes the public deck URL)', () => {
  const svg = fs.readFileSync(qrFile);
  expect(createHash('sha256').update(svg).digest('hex')).toBe(qrSha256);
  expect(svg.toString()).toContain('viewBox="0 0 570 570"');
});

for (const theme of ['dark', 'light']) {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
    test(`zero-to-hero slide 5 shows a visible, scannable-size QR code in the ${theme} theme at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(value => localStorage.setItem('slides-theme', value), theme);
      await page.goto(urls.http);
      await page.waitForFunction(() => window.Reveal?.isReady());
      await page.evaluate(() => Reveal.slide(2, 1));
      await page.waitForFunction(() => Reveal.getSlides().indexOf(Reveal.getCurrentSlide()) === 4);
      await page.waitForFunction(() => [Reveal.getCurrentSlide(), Reveal.getCurrentSlide().parentElement].every(el => getComputedStyle(el).opacity === '1'));
      await page.locator('img[src="assets/slides-qr.svg"]').evaluate(img => img.decode());
      const state = await page.evaluate(() => {
        const section = Reveal.getCurrentSlide();
        const img = section.querySelector('img[src="assets/slides-qr.svg"]');
        const box = img.getBoundingClientRect();
        const hidden = [];
        for (let node = img; node && node !== document.documentElement; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0) hidden.push(node.tagName);
        }
        const centre = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return {
          theme: document.documentElement.dataset.theme,
          title: section.querySelector('h2').textContent.trim(),
          alt: img.getAttribute('alt'),
          caption: section.querySelector('figcaption').textContent,
          natural: [img.naturalWidth, img.naturalHeight],
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
          hidden,
          onTop: centre === img,
          viewport: [innerWidth, innerHeight],
          noOverflow: section.scrollHeight <= section.clientHeight,
          layoutInside: section.querySelector('.qr-layout').getBoundingClientRect().bottom <= document.querySelector('.reveal').getBoundingClientRect().bottom,
        };
      });
      expect(state.theme).toBe(theme);
      expect(state.title).toBe('Setup check');
      expect(state.alt).toContain('slides.soumendrak.com/talks/2026/zero-to-hero-agent-observability/');
      expect(state.caption).toContain('Scan for these slides');
      expect(state.natural).toEqual([570, 570]);
      expect(state.box.width).toBeGreaterThanOrEqual(200);
      expect(Math.abs(state.box.width - state.box.height)).toBeLessThan(1);
      expect(state.box.x).toBeGreaterThanOrEqual(0);
      expect(state.box.y).toBeGreaterThanOrEqual(0);
      expect(state.box.x + state.box.width).toBeLessThanOrEqual(state.viewport[0]);
      expect(state.box.y + state.box.height).toBeLessThanOrEqual(state.viewport[1]);
      expect(state.hidden).toEqual([]);
      expect(state.onTop).toBe(true);
      expect(state.noOverflow).toBe(true);
      expect(state.layoutInside).toBe(true);
    });
  }
}
