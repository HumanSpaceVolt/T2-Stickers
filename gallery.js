/* Native picture viewer: keyboard Esc, backdrop-click, and focus restoration. */
const box=document.querySelector('.sticker-lightbox');
if(box){const lightboxImg=box.querySelector('img');const closeButton=box.querySelector('.lightbox-close');let trigger=null;
 document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{trigger=button;lightboxImg.src=button.dataset.lightbox;lightboxImg.alt=button.dataset.lightboxAlt||'Diseño ampliado';box.showModal();closeButton.focus();}));
 closeButton.addEventListener('click',()=>box.close());
 box.addEventListener('click',e=>{if(e.target===box)box.close();});
 box.addEventListener('close',()=>{lightboxImg.removeAttribute('src');trigger?.focus();});
}
