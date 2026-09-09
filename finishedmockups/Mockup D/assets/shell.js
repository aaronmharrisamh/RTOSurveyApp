(function () {
  'use strict';
  const {concepts,getConcept,icon,notes}=window.ORCHARD_D;
  const params=new URLSearchParams(location.search);
  let concept=getConcept(params.get('design'));
  const phone=()=>matchMedia('(max-width:700px)').matches||(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=600);
  let device=phone()?'mobile':params.get('device')==='desktop'?'desktop':'mobile';
  let filled=phone()||params.get('view')==='fill';
  let gallery=location.hash==='#mockups';
  let selected=concepts.indexOf(concept);
  const root=document.getElementById('review-root');
  root.innerHTML=`<section id="preview"><header class="review-bar"><button class="review-gallery">${icon('cards')} Compare designs</button><nav class="design-tabs" aria-label="Mockup designs">${concepts.map(c=>`<button data-open="${c.id}">${c.id.toUpperCase()}</button>`).join('')}</nav><button class="review-notes">Developer notes</button></header><main class="preview-stage"><div class="frame-space"><div class="device"><iframe title="Cherry On Together interactive survey" src="app.html?design=${concept.id}&device=${device}"></iframe></div></div></main><footer class="review-caption"><span id="caption-name"></span><span id="caption-size"></span></footer></section><section id="gallery" hidden><header class="gallery-header"><a href="index.html" class="gallery-brand"><img src="assets/orchard-mark.svg" alt=""><span><strong>Red Truck Orchards</strong><small>Cherry On Together survey</small></span></a><button class="return-preview">Back to survey ${icon('arrow')}</button></header><main class="gallery-main"><div class="gallery-intro"><span class="eyebrow">MOCKUP D · FIVE WAYS TO KEEP IT SIMPLE</span><h1>Find the right amount.</h1><p>D1 to D4 put less on the screen. D5 is the developer’s recommended balance.</p></div><div class="carousel" role="region" aria-roledescription="carousel" aria-label="Five mockup designs" tabindex="0"><div class="carousel-viewport"><div class="carousel-track">${concepts.map((c,i)=>`<article class="carousel-card" role="group" aria-roledescription="slide" aria-label="${i+1} of 5: ${c.name}"><div class="capture-panel"><div class="capture-phone"><img src="assets/previews/${c.id}-home.png" width="390" height="867" alt="${c.id.toUpperCase()} Today screen" loading="lazy"></div></div><div class="carousel-copy"><span class="concept-badge">${c.id.toUpperCase()}</span><span class="eyebrow">${c.tag}</span><h2>${c.name}</h2><p>${c.description}</p><a class="open-design" href="index.html?design=${c.id}">Try ${c.id.toUpperCase()} ${icon('arrow')}</a><button class="card-notes" data-notes="${c.id}">Read the design notes</button></div></article>`).join('')}</div></div><div class="carousel-controls"><button class="carousel-previous" aria-label="Previous design">${icon('back')}</button><div class="carousel-dots" aria-label="Choose a design">${concepts.map(c=>`<button data-slide="${c.id}" aria-label="Show ${c.id.toUpperCase()}">${c.id.toUpperCase()}</button>`).join('')}</div><button class="carousel-next" aria-label="Next design">${icon('arrow')}</button></div><p id="carousel-status" class="carousel-status" aria-live="polite"></p></div><p class="gallery-footnote">Try one daily survey. Open the calendar. Then compare the next design.</p></main><footer class="gallery-footer"><span>Interactive mockups · Sample data</span><a href="README.md">Preview and handoff notes</a></footer></section><dialog id="notes" aria-labelledby="notes-title"><button class="notes-close" aria-label="Close design notes">${icon('close')}</button><div id="notes-body"></div></dialog>`;
  const frame=root.querySelector('iframe'),box=root.querySelector('.device'),space=root.querySelector('.frame-space');
  const modal=document.getElementById('notes');
  function saveURL(){try{history.replaceState(null,'',`?design=${concept.id}&device=${device}&view=${filled?'fill':'review'}${gallery?'#mockups':''}`);}catch{}}
  function fit(){
    document.body.classList.toggle('filled',filled);document.body.dataset.device=device;
    box.className='device '+device;
    let width,height,scale=1;
    if(filled){width=device==='mobile'&&!phone()?Math.min(480,Math.max(320,innerHeight*9/20),innerWidth):innerWidth;height=innerHeight;}
    else{width=device==='mobile'?406:1280;height=device==='mobile'?883:860;const bar=root.querySelector('.review-bar').offsetHeight;scale=Math.min(1,Math.max(1,innerWidth-32)/width,Math.max(1,innerHeight-bar-56)/height);}
    box.style.width=width+'px';box.style.height=height+'px';box.style.transform=`scale(${scale})`;space.style.width=width*scale+'px';space.style.height=height*scale+'px';
    root.querySelectorAll('[data-open]').forEach(button=>{button.setAttribute('aria-current',button.dataset.open===concept.id?'page':'false');});
    document.getElementById('caption-name').textContent=concept.id.toUpperCase()+' · '+concept.name;
    document.getElementById('caption-size').textContent=device==='mobile'?'390 × 867 · approximately 20:9':'1280 × 860 · desktop';
    frame.title=concept.id.toUpperCase()+' · Cherry On Together survey';
    frame.contentWindow.postMessage({type:'d-view',device,filled},'*');saveURL();
  }
  function updateGallery(){
    const c=concepts[selected];
    root.querySelector('.carousel-track').style.transform=`translateX(-${selected*100}%)`;
    root.querySelectorAll('.carousel-card').forEach((card,index)=>{card.inert=index!==selected;card.setAttribute('aria-hidden',String(index!==selected));});
    root.querySelectorAll('[data-slide]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.slide===c.id)));
    root.querySelector('.carousel-previous').disabled=selected===0;root.querySelector('.carousel-next').disabled=selected===4;
    document.getElementById('carousel-status').textContent=`${selected+1} of 5 · ${c.id.toUpperCase()}`;
  }
  function showGallery(show){
    const wasGallery=gallery;
    gallery=show;document.getElementById('preview').hidden=show;document.getElementById('gallery').hidden=!show;
    if(show){selected=concepts.indexOf(concept);updateGallery();const heading=root.querySelector('.gallery-intro h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}else{fit();if(wasGallery)frame.focus();}
    saveURL();
  }
  function openConcept(id){concept=getConcept(id);frame.src=`app.html?design=${concept.id}&device=${device}`;showGallery(false);fit();}
  function openNotes(id){document.getElementById('notes-body').innerHTML=notes(getConcept(id));modal.showModal();modal.scrollTop=0;}
  root.addEventListener('click',event=>{
    const button=event.target.closest('button,a');if(!button)return;
    if(button.dataset.open){openConcept(button.dataset.open);return;}
    if(button.dataset.notes){openNotes(button.dataset.notes);return;}
    if(button.dataset.slide){selected=concepts.findIndex(c=>c.id===button.dataset.slide);updateGallery();return;}
    if(button.matches('.open-design')){event.preventDefault();openConcept(new URL(button.href).searchParams.get('design'));return;}
    if(button.matches('.gallery-brand')){event.preventDefault();showGallery(false);return;}
    if(button.matches('.review-gallery'))showGallery(true);
    if(button.matches('.return-preview'))showGallery(false);
    if(button.matches('.review-notes'))openNotes(concept.id);
    if(button.matches('.notes-close'))modal.close();
    if(button.matches('.carousel-previous')){selected=Math.max(0,selected-1);updateGallery();}
    if(button.matches('.carousel-next')){selected=Math.min(4,selected+1);updateGallery();}
  });
  const carousel=root.querySelector('.carousel');let swipeStart=null;
  carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selected=Math.max(0,Math.min(4,selected+(e.key==='ArrowRight'?1:-1)));updateGallery();}});
  carousel.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipeStart={x:e.clientX,y:e.clientY};});
  carousel.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){selected=Math.max(0,Math.min(4,selected+(dx<0?1:-1)));updateGallery();}});
  carousel.addEventListener('pointercancel',()=>{swipeStart=null;});
  addEventListener('message',e=>{
    if(e.source!==frame.contentWindow||(location.protocol!=='file:'&&e.origin!==location.origin))return;
    if(e.data?.type==='d-ready')fit();
    if(e.data?.type==='d-device'){device=device==='mobile'?'desktop':'mobile';if(device==='mobile')filled=phone();else if(phone())filled=false;fit();}
    if(e.data?.type==='d-frame'){filled=!filled;fit();}
    if(e.data?.type==='d-gallery')showGallery(true);
    if(e.data?.type==='d-notes')openNotes(concept.id);
  });
  modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
  addEventListener('hashchange',()=>showGallery(location.hash==='#mockups'));
  frame.addEventListener('load',fit);addEventListener('resize',fit);
  showGallery(gallery);fit();
})();
