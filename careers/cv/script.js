const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%3)*90+'ms';io.observe(el)});

/* counters (hero) */
$$('[data-count]').forEach(u=>{
  const end=+u.dataset.count,dec=String(end).includes('.')?2:0,t0=performance.now()+500;
  (function f(t){const p=Math.min(Math.max((t-t0)/1500,0),1);u.textContent=(end*(1-Math.pow(1-p,3))).toFixed(dec);if(p<1)requestAnimationFrame(f)})(t0);
});

/* experience carousel */
const rail=$('#rail'),bar=$('#pbar');
const step=()=>$('.job').offsetWidth+19;
$('#nx').onclick=()=>rail.scrollBy({left:step(),behavior:'smooth'});
$('#pv').onclick=()=>rail.scrollBy({left:-step(),behavior:'smooth'});
function prog(){
  const max=rail.scrollWidth-rail.clientWidth,p=max>0?rail.scrollLeft/max:0,w=rail.clientWidth/rail.scrollWidth;
  bar.style.width=(w*100)+'%';bar.style.marginLeft=(p*(1-w)*100)+'%';
}
rail.addEventListener('scroll',prog,{passive:true});addEventListener('resize',prog);prog();
rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('#nx').click();if(e.key==='ArrowLeft')$('#pv').click()});

/* flip cards */
$$('.flip').forEach(f=>f.addEventListener('click',()=>f.setAttribute('aria-pressed',f.getAttribute('aria-pressed')!=='true')));

/* glass spotlight */
$$('.glass').forEach(g=>g.addEventListener('mousemove',e=>{
  const b=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-b.left)+'px');g.style.setProperty('--my',(e.clientY-b.top)+'px');
}));