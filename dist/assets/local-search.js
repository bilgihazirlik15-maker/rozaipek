(() => {
  const base = new URL('../', document.currentScript.src);
  const forms = [...document.forms].filter(f => f.querySelector('input[name="searchword"]'));
  forms.forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = form.querySelector('input[name="searchword"]').value.trim();
    if (!query) return;
    const en = location.pathname.includes('/eng/');
    const container = document.querySelector('#sp-main-body') || document.querySelector('#sp-page-builder');
    try {
      const response = await fetch(new URL('assets/search-index.json', base));
      if (!response.ok) throw new Error('search index');
      const data = await response.json();
      const terms = query.toLocaleLowerCase('tr').split(/\s+/);
      const results = data.filter(p => p.path.startsWith('eng/') === en && terms.every(t => (p.title + ' ' + p.text).toLocaleLowerCase('tr').includes(t)));
      const panel = document.createElement('section'); panel.className = 'container'; panel.style.padding = '40px 15px';
      panel.setAttribute('aria-live', 'polite');
      const h = document.createElement('h1'); h.textContent = (en ? 'Search: ' : 'Arama: ') + query; panel.append(h);
      const count = document.createElement('p'); count.textContent = results.length + (en ? ' results' : ' sonuç'); panel.append(count);
      results.forEach(p => { const item = document.createElement('h3'); const a = document.createElement('a'); a.href = new URL(p.path, base).href; a.textContent = p.title; item.append(a); panel.append(item); });
      container.replaceChildren(panel); panel.scrollIntoView({behavior: 'smooth'});
    } catch { window.alert(en ? 'Search could not be loaded. Please try again.' : 'Arama yüklenemedi. Lütfen tekrar deneyin.'); }
  }));
})();
