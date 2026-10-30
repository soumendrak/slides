/* Teaching controls for this deck only. No network or randomly generated results. */
(() => {
  function init() {
    const meanSlide = document.getElementById('mean-percentiles');
    const tailSlide = document.getElementById('agent-tail');
    if (!meanSlide || !tailSlide) return;
    const rankGrid = meanSlide.querySelector('[data-latency-ranks]');
    const ranks = Array.from({ length: 50 }, (_, index) => {
      const tile = document.createElement('span');
      tile.className = `latency-rank${index === 49 ? ' slow' : ''}`;
      tile.setAttribute('aria-hidden', 'true');
      tile.innerHTML = `${index === 49 ? '30' : '1'} s<small>${index === 49 ? 'rank 50' : ''}</small>`;
      rankGrid.append(tile);
      return tile;
    });
    function choosePercentile(p) {
      const rank = Math.ceil(p / 100 * 50);
      ranks.forEach((tile, index) => {
        tile.classList.toggle('selected', index === rank - 1);
        tile.querySelector('small').textContent = index === rank - 1 ? `rank ${rank}` : index === 49 ? 'rank 50' : '';
      });
      meanSlide.querySelector('[data-latency-rank-explanation]').textContent = `p${p}: ⌈${p / 100} × 50⌉ = rank ${rank} → ${rank === 50 ? 30 : 1} s`;
      meanSlide.querySelectorAll('[data-latency-percentile]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.latencyPercentile) === p)));
    }
    meanSlide.querySelectorAll('[data-latency-percentile]').forEach(button => button.addEventListener('click', () => choosePercentile(Number(button.dataset.latencyPercentile))));
    choosePercentile(99);

    const stepGrid = tailSlide.querySelector('[data-agent-step-grid]');
    const steps = Array.from({ length: 100 }, () => {
      const tile = document.createElement('span');
      tile.className = 'agent-step';
      tile.setAttribute('aria-hidden', 'true');
      stepGrid.append(tile);
      return tile;
    });
    const play = tailSlide.querySelector('[data-tail-play]');
    const pauseButton = tailSlide.querySelector('[data-tail-pause]');
    const status = tailSlide.querySelector('[data-tail-status]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const printMode = new URLSearchParams(location.search).has('print-pdf');
    let count = 10;
    let frame = 0;
    let started = 0;
    let playing = false;
    const mayAnimate = () => !printMode && !reduced.matches && document.documentElement.dataset.motion !== 'off';
    function update(n) {
      count = Math.max(1, Math.min(100, Math.round(n)));
      const probability = 1 - 0.99 ** count;
      steps.forEach((tile, index) => tile.classList.toggle('active', index < count));
      stepGrid.setAttribute('aria-label', `${count} active steps out of 100 possible steps; each independently has a 1 percent chance of being slow`);
      tailSlide.querySelector('[data-tail-count]').textContent = `${count} ${count === 1 ? 'step' : 'steps'}`;
      tailSlide.querySelector('[data-tail-risk]').textContent = `${(probability * 100).toFixed(1)}%`;
      tailSlide.querySelector('[data-tail-formula]').textContent = `1 − 0.99^${count} = ${(probability * 100).toFixed(1)}%`;
      tailSlide.querySelector('[data-tail-risk-fill]').style.transform = `scaleX(${probability})`;
      tailSlide.querySelector('[data-tail-risk-track]').setAttribute('aria-label', `${(probability * 100).toFixed(1)} percent chance of at least one slow step`);
      tailSlide.querySelectorAll('[data-tail-preset]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tailPreset) === count)));
    }
    function stop() {
      const wasPlaying = playing;
      cancelAnimationFrame(frame);
      playing = false;
      pauseButton.disabled = true;
      play.textContent = 'Animate 1 → 100';
      if (wasPlaying) status.textContent = `Paused at ${count} steps. Choose a preset or replay from 1.`;
    }
    function syncMotion() {
      if (!mayAnimate()) stop();
      play.disabled = !mayAnimate();
      play.title = mayAnimate() ? 'Grow the chain over eight seconds' : 'Turn Motion on to animate; the step presets remain available';
    }
    function tick(now) {
      if (!playing) return;
      if (!mayAnimate() || document.hidden || Reveal.getCurrentSlide() !== tailSlide) { stop(); return; }
      const n = Math.min(100, 1 + Math.floor((now - started) / 8000 * 99));
      if (n !== count) update(n);
      if (n === 100) { stop(); status.textContent = '100 independent steps: 63.4% encounter at least one slow step. This is a synthetic probability model, not a request p99.'; return; }
      frame = requestAnimationFrame(tick);
    }
    play.addEventListener('click', event => {
      if (!mayAnimate() || playing) return;
      // A keyboard activation can reach the final explanatory state without motion.
      if (event.detail === 0) { update(100); status.textContent = '100 steps: 63.4% chance of at least one slow step.'; return; }
      update(1);
      playing = true;
      started = performance.now();
      pauseButton.disabled = false;
      play.textContent = 'Animating…';
      status.textContent = 'Adding steps from 1 to 100. Each added step has the same independent 1% slow chance.';
      frame = requestAnimationFrame(tick);
    });
    pauseButton.addEventListener('click', () => { stop(); status.textContent = `Paused at ${count} steps. Choose a preset or replay from 1.`; });
    tailSlide.querySelectorAll('[data-tail-preset]').forEach(button => button.addEventListener('click', () => {
      stop();
      update(Number(button.dataset.tailPreset));
      status.textContent = `${count} independent steps. Synthetic model; this is not the whole request’s p99.`;
    }));
    // Keep Enter/Space on a teaching control from also advancing Reveal.
    document.querySelectorAll('.latency-controls').forEach(controls => controls.addEventListener('keydown', event => {
      if ([' ', 'Enter'].includes(event.key)) event.stopPropagation();
    }));
    Reveal.on('slidechanged', stop);
    Reveal.on('overviewshown', stop);
    Reveal.on('paused', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('beforeprint', stop);
    reduced.addEventListener('change', syncMotion);
    new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    update(10);
    syncMotion();
    Reveal.layout();
  }
  if (window.Reveal.isReady()) init();
  else Reveal.on('ready', init);
})();
