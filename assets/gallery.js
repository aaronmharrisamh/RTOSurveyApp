(function(){
 const requested=new URLSearchParams(location.search).get('device');
 let device=requested==='mobile'?'mobile':'desktop';
 function apply(updateUrl){
   const mobile=device==='mobile';
   document.body.classList.toggle('mobile-gallery',mobile);
   document.querySelectorAll('[data-gallery-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryDevice===device)));
   document.querySelectorAll('[data-preview-image]').forEach(img=>{img.src='assets/previews/'+img.dataset.previewImage+'-'+device+'.png';img.alt=img.alt.replace(/desktop|mobile/,device);});
   document.querySelectorAll('[data-preview-link]').forEach(a=>a.href='mockup-'+a.dataset.previewLink+'.html?device='+device);
   if(updateUrl)try{history.replaceState(null,'','?device='+device+location.hash)}catch{}
 }
 document.querySelectorAll('[data-gallery-device]').forEach(button=>button.addEventListener('click',()=>{device=button.dataset.galleryDevice;apply(true);}));
 apply(false);
 if(/^#b[1-5]$/.test(location.hash))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'}));
})();
