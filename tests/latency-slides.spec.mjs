import { test, expect } from '@playwright/test';

const deck = 'http://127.0.0.1:4173/talks/2026/zero-to-hero-agent-observability/';
async function open(page, id) {
  await page.goto(`${deck}#/${id}`);
  await page.waitForFunction(id => window.Reveal?.isReady() && Reveal.getCurrentSlide()?.id === id, id);
}

test('percentile controls choose the correct ranked wait without keyboard navigation', async ({ page }) => {
  await open(page, 'mean-percentiles');
  await expect(page.locator('.latency-rank')).toHaveCount(50);
  await expect(page.locator('.latency-rank.selected')).toContainText('30 s');
  const p95 = page.locator('[data-latency-percentile="95"]');
  await p95.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.latency-rank.selected')).toContainText('rank 48');
  await expect(page.locator('[data-latency-rank-explanation]')).toHaveText('p95: ⌈0.95 × 50⌉ = rank 48 → 1 s');
  expect(await page.evaluate(() => Reveal.getSlides().indexOf(Reveal.getCurrentSlide()))).toBe(21);
  await page.locator('[data-latency-percentile="99"]').click();
  await expect(page.locator('.latency-rank.selected')).toContainText('rank 50');
  await page.locator('a[href="#/agent-tail"]').click();
  await expect(page.locator('#agent-tail')).toHaveClass(/present/);
});

test('step presets show calculated risks, playback completes, pause and navigation stop it', async ({ page }) => {
  await open(page, 'agent-tail');
  for (const [n, risk] of [[1, '1.0%'], [10, '9.6%'], [25, '22.2%'], [100, '63.4%']]) {
    await page.locator(`[data-tail-preset="${n}"]`).click();
    await expect(page.locator('.agent-step.active')).toHaveCount(n);
    await expect(page.locator('[data-tail-risk]')).toHaveText(risk);
  }
  await page.clock.install();
  await page.locator('[data-tail-play]').click();
  await page.clock.runFor(1000);
  expect(await page.locator('.agent-step.active').count()).toBeGreaterThan(1);
  await page.locator('[data-tail-pause]').click();
  const paused = await page.locator('.agent-step.active').count();
  await page.clock.runFor(1000);
  await expect(page.locator('.agent-step.active')).toHaveCount(paused);
  await page.locator('[data-tail-play]').click();
  await page.clock.runFor(8100);
  await expect(page.locator('[data-tail-risk]')).toHaveText('63.4%');
  await expect(page.locator('[data-tail-pause]')).toBeDisabled();
  await page.locator('[data-tail-play]').click();
  await page.clock.runFor(1000);
  await page.evaluate(() => Reveal.next());
  const left = await page.locator('.agent-step.active').count();
  await page.clock.runFor(1000);
  await expect(page.locator('.agent-step.active')).toHaveCount(left);
});

test('motion off stops playback while presets remain available', async ({ page }) => {
  await open(page, 'agent-tail');
  await page.locator('[data-tail-play]').click();
  await page.waitForFunction(() => document.querySelectorAll('.agent-step.active').length > 1);
  await page.locator('[data-action="motion"]').click();
  await expect(page.locator('[data-tail-play]')).toBeDisabled();
  await expect(page.locator('[data-tail-pause]')).toBeDisabled();
  await page.locator('[data-tail-preset="25"]').click();
  await expect(page.locator('[data-tail-risk]')).toHaveText('22.2%');
});

test('reduced motion and PDF show meaningful static states', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'agent-tail');
  await expect(page.locator('[data-tail-play]')).toBeDisabled();
  await page.locator('[data-tail-preset="100"]').click();
  await expect(page.locator('[data-tail-risk]')).toHaveText('63.4%');
  await page.goto(`${deck}?print-pdf#/agent-tail`);
  await page.waitForFunction(() => window.Reveal?.isReady());
  await expect(page.locator('[data-tail-play]')).toBeHidden();
  for (const n of [1, 10, 25, 100]) await expect(page.locator(`[data-tail-preset="${n}"]`)).toBeVisible();
  await expect(page.locator('.agent-step.active')).toHaveCount(10);
});

test('slide 26 marks the five-step method as optional with a superscript', async ({ page }) => {
  await page.goto(deck);
  await page.waitForFunction(() => window.Reveal?.isReady());
  const title = page.locator('.optional-marker');
  await expect(title).toHaveText('#');
  await expect(title).toHaveAttribute('aria-label', 'Optional slide');
  expect(await title.evaluate(el => getComputedStyle(el).verticalAlign)).toBe('super');
  expect(await title.evaluate(el => Reveal.getSlides().indexOf(el.closest('section')))).toBe(25);
});
