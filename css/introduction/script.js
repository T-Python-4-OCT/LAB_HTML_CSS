/* theme */
const root=document.documentElement,tb=document.getElementById('theme');
tb.onclick=()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light'};

/* typing */
const roles=["AI Engineer","Software Developer","Machine Learning Enthusiast","Computer Vision Explorer"];
const tw=document.getElementById('tw');let r=0,c=0,del=false;
(function tick(){
  const w=roles[r];tw.textContent=w.slice(0,c);
  if(!del&&c===w.length){del=true;return setTimeout(tick,1400)}
  if(del&&c===0){del=false;r=(r+1)%roles.length}
  c+=del?-1:1;setTimeout(tick,del?40:80);
})();

/* scroll progress, timeline fill, active nav */
const bar=document.getElementById('bar'),fill=document.getElementById('fill'),tl=document.getElementById('tl');
const links=[...document.querySelectorAll('nav a.l')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
function onScroll(){
  const h=document.documentElement;
  bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  const b=tl.getBoundingClientRect();
  const p=Math.min(Math.max((innerHeight*.7-b.top)/b.height,0),1);
  fill.style.height=(p*(b.height-12))+'px';
  let cur=-1;secs.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.4)cur=i});
  links.forEach((a,i)=>a.classList.toggle('on',i===cur));
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* reveal + counters */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.2});
document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%3)*90+'ms';io.observe(el)});

document.querySelectorAll('[data-n]').forEach(el=>{
  const n=+el.dataset.n;let v=0;
  const t=setInterval(()=>{v++;el.textContent=v;if(v>=n)clearInterval(t)},350);
});

/* card spotlight + tilt, cursor glow */
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const b=card.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
    card.style.setProperty('--mx',x+'px');card.style.setProperty('--my',y+'px');
    card.style.transform=`perspective(700px) rotateY(${(x/b.width-.5)*8}deg) rotateX(${(.5-y/b.height)*8}deg)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});
const glow=document.getElementById('glow');
addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});