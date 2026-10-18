// The origin check lives in shared/scripts/slides.js, so every deck and every deck
// template must load it and leave Reveal.initialize to it.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const decks = fs.readdirSync(path.join(root, 'talks'), { recursive: true })
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('talks', file))
  .filter(file => fs.readFileSync(path.join(root, file), 'utf8').includes('reveal.min.js'));
const templates = ['README.md', '.claude/UPDATE_PROMPT.md'].flatMap(file =>
  [...fs.readFileSync(path.join(root, file), 'utf8').matchAll(/```html\n([\s\S]*?)```/g)]
    .map(([, block]) => block)
    .filter(block => /reveal(\.min)?\.js"/.test(block))
    .map((block, i) => [`${file} template ${i + 1}`, block]));

test('there are decks and templates to check', () => {
  expect(decks.length).toBeGreaterThan(0);
  expect(templates.length).toBeGreaterThanOrEqual(2);
});

for (const [name, html] of [...decks.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]), ...templates]) {
  test(`${name} loads slides.js and does not initialize reveal.js itself`, () => {
    expect(html).toContain('shared/scripts/slides.js');
    expect(html).not.toMatch(/Reveal\.initialize\s*\(/);
  });
}
