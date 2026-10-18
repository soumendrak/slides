// reveal.js runs API methods and the notes plugin handshake for any window that posts a
// message. These tests check that a deck ignores other origins, including an opaque
// ('null') one, and that the speaker view, which talks to the deck by postMessage, still works.
// DECK_BASE=https://<preview> runs the other-origin checks against a deployed site.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const deckBase = process.env.DECK_BASE || 'http://127.0.0.1:4173';
const sender = 'http://localhost:4173/tests/fixtures/sender.html';
const notesDeck = '/tests/fixtures/notes-deck.html';
const decks = ['/talks/2026/lili-on-coolify/', '/talks/2026/iter-claude-limits/'];
if (!process.env.DECK_BASE) decks.push(notesDeck);

const ready = page => page.waitForFunction(() => window.Reveal?.isReady());
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const deckState = deck => deck.evaluate(() => ({
  h: Reveal.getIndices().h,
  controls: Reveal.getConfig().controls,
  lightbox: !!document.querySelector('.r-overlay-preview'),
}));
// setState with previewIframe still opens a lightbox in 6.0.2, which blocks the
// showPreview and previewIframe methods themselves.
const drive = [
  { method: 'slide', args: [2] },
  { method: 'configure', args: [{ controls: false }] },
  { method: 'setState', args: [{ indexh: 2, previewIframe: 'http://127.0.0.1:4173/index.html' }] },
];

async function openFromOtherOrigin(page, url) {
  const [deck] = await Promise.all([page.waitForEvent('popup'), page.goto(`${sender}?deck=${encodeURIComponent(url)}`)]);
  await ready(deck);
  return deck;
}

for (const deckPath of decks) {
  test(`other origin cannot call slide(), configure() or setState() on ${deckPath}`, async ({ page }) => {
    const deck = await openFromOtherOrigin(page, deckBase + deckPath);
    await page.evaluate(messages => messages.forEach(m => send(m)), drive);
    await pause(1000);
    expect(await deckState(deck)).toEqual({ h: 0, controls: true, lightbox: false });

    // Control: the same messages from the deck's own origin take effect.
    await deck.evaluate(messages => messages.forEach(m => postMessage(JSON.stringify(m), '*')), drive);
    await expect.poll(() => deckState(deck)).toEqual({ h: 2, controls: false, lightbox: true });
  });

  test(`a foreign page the deck opened cannot drive ${deckPath}`, async ({ page }) => {
    await page.goto(deckBase + deckPath);
    await ready(page);
    const [opened] = await Promise.all([page.waitForEvent('popup'), page.evaluate(url => { open(url, 'foreign'); }, sender)]);
    await opened.waitForLoadState();
    await opened.evaluate(messages => messages.forEach(m => send(m)), drive);
    await pause(1000);
    expect(await deckState(page)).toEqual({ h: 0, controls: true, lightbox: false });
  });

  test(`null-origin frame cannot drive ${deckPath}`, async ({ page, context }) => {
    await page.goto(sender);
    const [deck] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(([url, messages]) => sendFromNullOrigin(url, messages), [deckBase + deckPath, drive]),
    ]);
    await ready(deck);
    await pause(1500);
    expect(await deckState(deck)).toEqual({ h: 0, controls: true, lightbox: false });
  });
}

test.describe('notes plugin', () => {
  test.skip(!!process.env.DECK_BASE, 'needs the notes fixture, which is not deployed');

  test('other origin gets no speaker notes from the handshake', async ({ page }) => {
    await openFromOtherOrigin(page, deckBase + notesDeck);
    await page.evaluate(() => send({ namespace: 'reveal-notes', type: 'heartbeat' }));
    await pause(1500);
    const replies = await page.evaluate(() => received.filter(data => String(data).includes('reveal-notes')));
    expect(replies).toEqual([]);
  });

  const fileUrl = pathToFileURL(path.resolve(import.meta.dirname, 'fixtures/notes-deck.html')).href;

  test('on file://, another local page that opened the deck cannot drive it', async ({ page }) => {
    const fileSender = pathToFileURL(path.resolve(import.meta.dirname, 'fixtures/sender.html')).href;
    const [deck] = await Promise.all([page.waitForEvent('popup'), page.goto(`${fileSender}?deck=${encodeURIComponent(fileUrl)}`)]);
    await ready(deck);
    await page.evaluate(messages => messages.forEach(m => send(m)), drive);
    await pause(1000);
    expect(await deckState(deck)).toEqual({ h: 0, controls: true, lightbox: false });
  });
  for (const [name, url] of [['http', deckBase + notesDeck], ['file://', fileUrl]]) {
    test(`speaker view stays in sync over ${name}`, async ({ page }) => {
      await page.goto(url);
      await ready(page);
      const [speaker] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('s')]);
      const notes = () => speaker.evaluate(() => document.querySelector('.speaker-controls-notes .value')?.textContent.trim());
      const preview = async () => {
        const frame = speaker.frames().find(f => f.url().includes('postMessageEvents=true'));
        return frame?.evaluate(() => window.Reveal?.isReady() && Reveal.getIndices().h);
      };
      await expect.poll(notes).toBe('notes for one');

      // Deck to speaker view: notes and the current-slide preview follow.
      await page.evaluate(() => Reveal.slide(1));
      await expect.poll(notes).toBe('notes for two');
      await expect.poll(preview).toBe(1);

      // Speaker view to deck: a key pressed in the speaker view moves the deck.
      await speaker.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39, bubbles: true })));
      await expect.poll(() => page.evaluate(() => Reveal.getIndices().h)).toBe(2);
    });
  }
});
