window.RevealPele = {
  id: 'pele',
  init(deck) {
    if (!window.pele) return;
    deck.getRevealElement().querySelectorAll('pre > code.mermaid').forEach((code, index) => {
      const diagram = document.createElement('div');
      diagram.className = 'pele-diagram';
      code.parentElement.replaceWith(diagram);
      try {
        diagram.innerHTML = window.pele.render(code.textContent, {
          fontFamily: getComputedStyle(diagram).fontFamily,
          fontSize: 24,
          idPrefix: `pele-${index}-`
        }).svg;
      } catch (error) {
        diagram.classList.add('pele-error');
        diagram.textContent = error.message;
      }
    });
  }
};
