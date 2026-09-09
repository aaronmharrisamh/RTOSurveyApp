(() => {
  const id = document.body.dataset.design;
  const c = window.CHERRY_CONCEPTS.find(item => item.id === id);
  const icons = {desktop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',mobile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/></svg>'};
  let device = new URLSearchParams(location.search).get('device') || (innerWidth < 700 ? 'mobile' : 'desktop');
  if (!['mobile','desktop'].includes(device)) device = 'desktop';
  document.getElementById('preview-shell').innerHTML = `
    <header class="review-bar"><a class="review-brand" href="index.html"><img src="assets/cherry.svg" alt=""><span>Cherry Together<small>Design study · Revision B</small></span></a>
      <nav class="review-links" aria-label="Design concepts">${window.CHERRY_CONCEPTS.map(item => `<a href="mockup-${item.id}.html" ${item.id===id?'aria-current="page"':''} title="${item.name}">${item.id.toUpperCase()}</a>`).join('')}</nav>
      <div class="review-tools"><div class="segmented" aria-label="Preview size"><button data-device="desktop" aria-pressed="false">${icons.desktop} Desktop</button><button data-device="mobile" aria-pressed="false">${icons.mobile} Mobile</button></div><button class="quiet-button" id="notes-button">${id==='b5'?'Why this choice':'Design notes'}</button></div>
    </header>
    <section class="preview-heading"><div><h1>${id.toUpperCase()} / ${c.name}</h1><p>${c.desc}</p></div><span class="concept-tag">${c.tag}</span></section>
    <div class="preview-stage"><div class="frame-space"><div class="device"><iframe title="${c.name} interactive participant preview" src="preview.html?design=${id}&device=${device}"></iframe></div></div></div>
    <footer class="frame-foot"><span id="dimensions"></span><span>Sample data · Try the check-in and calendar</span><button id="reset" class="quiet-button">Reset preview</button><a href="preview.html?design=${id}&device=${device}" id="full-size-link">Open full size ↗</a></footer>
    <dialog class="notes-dialog" id="notes"><header><span><small class="concept-tag">${id==='b5'?'2026 UX Designer’s choice':c.tag}</small><h2>${c.name}</h2></span><button class="close" aria-label="Close design notes">×</button></header><p>${c.desc}</p><ol>${c.why.map(reason=>`<li>${reason}</li>`).join('')}</ol><h3>What to consider</h3><p>${c.trade}</p>${id==='b5'?`<p class="judgment">This is my recommendation for this brief in 2026. It is a design judgment, not a claim that one style works best for every person.</p><h3>Reasons behind the approach</h3><p class="sources">Large, well-spaced controls: <a href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" target="_blank" rel="noopener">W3C guidance</a>.<br>Show details when needed: <a href="https://www.nngroup.com/articles/progressive-disclosure/" target="_blank" rel="noopener">Nielsen Norman Group</a>.<br>Allow less motion: <a href="https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html" target="_blank" rel="noopener">W3C motion guidance</a>.</p>`:''}<h3>Useful next step</h3><p>Choose the layout and tone you prefer. We can combine parts of different concepts before updating the app plan.</p></dialog>`;
  const frame = document.querySelector('iframe');
  const shell = document.querySelector('.device');
  const space = document.querySelector('.frame-space');
  function fit() {
    const w = device === 'mobile' ? 390 : 1280;
    const h = device === 'mobile' ? 867 : 860;
    const outerW = w + (device === 'mobile' ? 20 : 2);
    const outerH = h + (device === 'mobile' ? 20 : 2);
    const availableWidth = document.querySelector('.preview-stage').clientWidth - (innerWidth < 850 ? 24 : 48);
    const headingBottom = document.querySelector('.preview-heading').getBoundingClientRect().bottom;
    const availableHeight = Math.max(420,innerHeight - headingBottom - 80);
    const scale = Math.min(1,availableWidth/outerW,availableHeight/outerH);
    shell.className = 'device ' + device;
    frame.width = w; frame.height = h;
    shell.style.width = outerW+'px'; shell.style.height=outerH+'px';
    shell.style.transform = 'scale('+scale+')';
    space.style.width = outerW*scale+'px'; space.style.height = outerH*scale+'px';
    frame.contentWindow.postMessage({type:'preview-device',device},'*');
    document.getElementById('full-size-link').href='preview.html?design='+id+'&device='+device;
    document.querySelector('.review-brand').href='index.html?device='+device+'#'+id;
    document.getElementById('dimensions').textContent = device==='mobile'?'390 × 867 · ≈20:9 phone':'1280 × 860 · Desktop';
    document.querySelectorAll('[data-device]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.device===device)));
    document.querySelectorAll('.review-links a').forEach(a=>a.search='?device='+device);
  }
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{device=button.dataset.device;try{history.replaceState(null,'','?device='+device)}catch{}fit()}));
  const notes=document.getElementById('notes');
  document.getElementById('notes-button').onclick=()=>notes.showModal();
  notes.querySelector('.close').onclick=()=>notes.close();
  notes.addEventListener('click',event=>{if(event.target===notes){const r=notes.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)notes.close()}});
  document.getElementById('reset').onclick=()=>frame.contentWindow.postMessage({type:'reset-preview'},'*');
  frame.addEventListener('load',fit);
  addEventListener('resize',fit);
  fit();
  if(new URLSearchParams(location.search).get('notes')==='1') notes.showModal();
})();
