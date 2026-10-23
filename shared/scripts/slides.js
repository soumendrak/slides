/* Shared presentation defaults for Reveal.js 6.0.2. */
(() => {
  // reveal.js runs any API method a postMessage names without checking the sender's
  // origin, and its notes plugin answers any window's heartbeat. Only same-origin
  // windows (the speaker view and its slide previews) may talk to a deck.
  // A deck opened from disk sees every message's origin as 'null', so there it only
  // accepts the speaker window it opened, or, when it is one of the speaker view's
  // previews (loaded with ?receiver), the speaker window that frames it.
  function fromOwnSpeakerView(event) {
    if (location.protocol !== 'file:' || event.origin !== 'null') return false;
    const isPreview = new URLSearchParams(location.search).has('receiver');
    return event.source?.opener === window || (isPreview && event.source === window.parent);
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin && !fromOwnSpeakerView(event)) event.stopImmediatePropagation();
  }, true);
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 760px)');
  const printMode = new URLSearchParams(location.search).has('print-pdf');
  const themeStorage = (() => {
    try { return window.localStorage; } catch { return null; }
  })();
  const savedTheme = themeStorage ? themeStorage.getItem('slides-theme') : null;
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  let currentTheme = savedTheme || systemTheme;
  root.dataset.theme = currentTheme;
  document.querySelectorAll('.comparison-table').forEach(table => {
    const headers = [...table.querySelectorAll('thead th')];
    headers.forEach(header => header.setAttribute('scope', 'col'));
    table.querySelectorAll('tbody tr').forEach(row => {
      [...row.children].forEach((cell, index) => {
        cell.dataset.label = headers[index]?.textContent.trim() || '';
        // Wrap the value so the mobile label and value remain two grid items.
        const value = document.createElement('span');
        while (cell.firstChild) value.append(cell.firstChild);
        cell.append(value);
      });
    });
  });
  let motionEnabled = !reducedMotion.matches;

  const toolbar = document.createElement('nav');
  toolbar.className = 'deck-toolbar';
  toolbar.setAttribute('aria-label', 'Presentation tools');
  toolbar.innerHTML = `
    <a href="../../../">All talks</a>
    <span class="deck-title"></span>
    <button type="button" data-action="overview" title="Show all slides (Esc)">Overview</button>
    <button type="button" data-action="motion" aria-pressed="false">Motion</button>
    <button type="button" data-action="help">Help</button>`;
  const help = document.createElement('dialog');
  help.className = 'deck-help';
  help.setAttribute('aria-labelledby', 'deck-help-title');
  help.innerHTML = `<h2 id="deck-help-title">Presentation shortcuts</h2>
    <dl><dt>← / →</dt><dd>Previous / next slide</dd><dt>Space</dt><dd>Next slide</dd>
    <dt>Shift + →</dt><dd>Jump to next section</dd>
    <dt>Shift + ←</dt><dd>Jump to previous section</dd>
    <dt>T</dt><dd>Toggle light and dark theme</dd>
    <dt>Esc</dt><dd>Overview / close help</dd><dt>F</dt><dd>Fullscreen</dd>
    <dt>Home / End</dt><dd>First / last slide</dd>${window.RevealNotes ? '<dt>S</dt><dd>Speaker notes</dd>' : ''}</dl>
    <p>On phones, scroll inside a slide to read the rest. Use the arrows to continue.</p>
    <form method="dialog"><button>Close</button></form>`;
  const slideIndex = document.createElement('dialog');
  slideIndex.className = 'deck-help deck-index';
  slideIndex.setAttribute('aria-labelledby', 'deck-index-title');
  slideIndex.innerHTML = '<h2 id="deck-index-title">All slides</h2><ol></ol><form method="dialog"><button>Close</button></form>';
  document.body.append(toolbar, help, slideIndex);
  const motionButton = toolbar.querySelector('[data-action="motion"]');

  function syncMotion() {
    root.dataset.motion = motionEnabled ? 'on' : 'off';
    motionButton.setAttribute('aria-pressed', String(motionEnabled));
    motionButton.textContent = `Motion ${motionEnabled ? 'on' : 'off'}`;
    motionButton.disabled = reducedMotion.matches;
    motionButton.title = reducedMotion.matches ? 'Reduced motion is enabled by your system' : 'Toggle slide transitions';
    if (window.Reveal.isReady()) {
      Reveal.configure({ transition: motionEnabled ? 'fade' : 'none', backgroundTransition: motionEnabled ? 'fade' : 'none' });
    }
  }

  function syncTheme() {
    root.dataset.theme = currentTheme;
    if (themeStorage) themeStorage.setItem('slides-theme', currentTheme);
  }
  syncMotion();
  syncTheme();
  reducedMotion.addEventListener('change', () => { motionEnabled = !reducedMotion.matches; syncMotion(); });
  motionButton.addEventListener('click', () => { motionEnabled = !motionEnabled; syncMotion(); });
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (event.ctrlKey || event.metaKey || event.altKey || target && target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return;
    if (event.key.toLowerCase() === 't') {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      syncTheme();
    }
  }, true);
  toolbar.querySelector('[data-action="overview"]').addEventListener('click', event => {
    if (smallScreen.matches) {
      const list = slideIndex.querySelector('ol');
      list.replaceChildren();
      Reveal.getSlides().forEach((slide, index) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${index + 1}. ${slide.querySelector('h1, h2')?.textContent || 'Slide'}`;
        if (slide === Reveal.getCurrentSlide()) button.setAttribute('aria-current', 'true');
        button.addEventListener('click', () => {
          const { h, v } = Reveal.getIndices(slide);
          Reveal.slide(h, v);
          slideIndex.close();
          document.activeElement?.blur();
        });
        item.append(button);
        list.append(item);
      });
      slideIndex.showModal();
    } else {
      Reveal.toggleOverview();
      event.currentTarget.blur();
    }
  });
  toolbar.querySelector('[data-action="help"]').addEventListener('click', () => help.showModal());
  help.addEventListener('click', event => { if (event.target === help) help.close(); });

  Reveal.initialize({
    width: 1280,
    height: 800,
    margin: 0.05,
    minScale: 0.2,
    maxScale: 1.5,
    hash: true,
    history: false,
    navigationMode: 'linear',
    transition: motionEnabled ? 'fade' : 'none',
    transitionSpeed: 'fast',
    backgroundTransition: motionEnabled ? 'fade' : 'none',
    overview: !smallScreen.matches,
    controls: true,
    controlsTutorial: false,
    controlsBackArrows: 'visible',
    slideNumber: 'c/t',
    progress: true,
    center: !smallScreen.matches || printMode,
    disableLayout: smallScreen.matches && !printMode,
    touch: !smallScreen.matches,
    keyboardCondition: event => !help.open && !slideIndex.open && (!toolbar.contains(document.activeElement) || ![' ', 'Enter'].includes(event.key)),
    pdfSeparateFragments: false,
    // Speaker view (S) works in decks that load reveal.js's notes plugin.
    plugins: [window.RevealNotes].filter(Boolean)
  }).then(() => {
    function jumpSection(direction) {
      const horizontalSlides = [...document.querySelector('.reveal .slides').children]
        .filter(element => element.tagName === 'SECTION');
      const starts = [];
      let previousGroup;
      horizontalSlides.forEach((slide, h) => {
        const title = slide.querySelector('h1, h2')?.textContent.trim() || '';
        const continuation = title.match(/^(.*)\s+\(\d+\/\d+\)$/);
        const group = continuation ? continuation[1] : `slide:${h}`;
        if (group !== previousGroup) starts.push(h);
        previousGroup = group;
      });
      const { h } = Reveal.getIndices();
      const currentStart = starts.filter(start => start <= h).pop();
      const target = direction > 0
        ? starts.find(start => start > h)
        : starts.filter(start => start < currentStart).pop();
      if (target !== undefined) {
        if (Reveal.isOverview()) Reveal.toggleOverview(false);
        Reveal.slide(target, 0);
      }
    }

    // Capture these combinations before Reveal's normal linear arrow navigation.
    document.addEventListener('keydown', event => {
      if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey
        || !['ArrowRight', 'ArrowLeft'].includes(event.key)
        || help.open || slideIndex.open
        || event.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      jumpSection(event.key === 'ArrowRight' ? 1 : -1);
    }, true);

    function updateTitle() {
      const slide = Reveal.getCurrentSlide();
      toolbar.querySelector('.deck-title').textContent = slide.querySelector('h1, h2')?.textContent || document.title;
      toolbar.querySelector('[data-action="overview"]').setAttribute('aria-pressed', String(Reveal.isOverview()));
    }
    updateTitle();
    Reveal.on('slidechanged', updateTitle);
    Reveal.on('overviewshown', updateTitle);
    Reveal.on('overviewhidden', updateTitle);
    smallScreen.addEventListener('change', () => {
      if (smallScreen.matches && Reveal.isOverview()) Reveal.toggleOverview(false);
      Reveal.configure({ overview: !smallScreen.matches, disableLayout: smallScreen.matches && !printMode, center: !smallScreen.matches || printMode, touch: !smallScreen.matches });
      Reveal.layout();
    });
  });
})();
