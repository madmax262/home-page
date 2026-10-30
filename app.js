const $ = selector => document.querySelector(selector);
const content = await fetch('/content/home.json').then(r => {if (!r.ok) throw Error('Content could not load'); return r.json()});
const text = (selector, value) => $(selector).textContent = value;
const paragraphs = (selector, values) => $(selector).replaceChildren(...values.map(value => {const p=document.createElement('p');p.textContent=value;return p}));
function lettering(selector, value, spacing) {$(selector).replaceChildren(...Array.from(value).map((letter,i)=>{const span=document.createElement('span');span.textContent=letter;span.style.letterSpacing=`${spacing[i] || 0}em`;return span}));}
function imageSlot(el, source, alt) {if(source){const img=document.createElement('img');img.src=source;img.alt=alt;img.setAttribute('data-pin-nopin','true');img.setAttribute('nopin','nopin');img.loading='lazy';el.append(img);el.classList.add('has-image')}}
let noticeTimer;
function notice(message){text('#notice',message);$('#notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').hidden=true,4500)}
document.title=content.site.title;$('meta[name="description"]').content=content.site.description;
lettering('#brand',content.site.brand,[0,-.05,-.04]);lettering('.first-name',content.hero.firstName,[0,-.05,-.04]);lettering('.last-name',content.hero.lastName,[-.04,-.07,-.04,-.06,-.07]);
text('#intro-title',content.hero.title);paragraphs('.intro-body',content.hero.paragraphs);
text('#expertise-title',content.expertise.title);
for(const item of content.expertise.items){const article=document.createElement('article');article.className='expertise-item';const heading=document.createElement('h3');heading.textContent=item.title;const description=document.createElement('p');description.textContent=item.description;article.append(heading,description);$('.expertise-list').append(article)}
for(const project of content.projects){
  const card=document.createElement('article');
  card.className='project-card';
  const image=document.createElement('div');
  image.className='project-image image-slot';
  imageSlot(image,project.image,project.imageAlt);
  const copy=document.createElement('div');
  copy.className='project-copy';
  const title=document.createElement('h3');
  title.textContent=project.title;
  const arrow=document.createElement('img');
  arrow.className='project-arrow';
  arrow.src='/assets/project-arrow.svg';
  arrow.alt='';
  arrow.setAttribute('aria-hidden','true');
  arrow.setAttribute('data-pin-nopin','true');
  arrow.setAttribute('nopin','nopin');
  title.append(arrow);
  const description=document.createElement('p');
  description.textContent=project.description;
  copy.append(title,description);
  card.append(image,copy);
  $('#projects').append(card);
}
text('#about-title',content.about.title);paragraphs('.about-body',content.about.paragraphs);imageSlot($('.about-image'),content.about.image,content.about.imageAlt);text('#contact-title',content.contact.title);
for(const [i,item] of content.contact.links.entries()){if(i){const separator=document.createElement('span');separator.textContent='  ·  ';separator.setAttribute('aria-hidden','true');$('.contact-links').append(separator)}const link=document.createElement('a');link.textContent=item.label;link.href=item.url;if(item.url.startsWith('https:')){link.target='_blank';link.rel='noopener noreferrer'}$('.contact-links').append(link)}
for(const [i,item] of content.contact.links.slice(0,3).entries()){if(i){const separator=document.createElement('span');separator.textContent='    ';separator.setAttribute('aria-hidden','true');$('.intro-links').append(separator)}const link=document.createElement('a');link.textContent=item.label;link.href=item.url;if(item.url.startsWith('https:')){link.target='_blank';link.rel='noopener noreferrer'}$('.intro-links').append(link)}
const menu=$('.menu-button'), navigation=$('#navigation');
menu.setAttribute('aria-label',content.ui.menuLabel);
navigation.inert=true;
for(const [id,label] of [['projects',content.ui.work],['expertise',content.ui.expertise],['about',content.ui.about],['contact',content.ui.contact]]){
  const link=document.createElement('a');
  link.href=`#${id}`;
  link.textContent=label;
  link.onclick=()=>closeMenu();
  navigation.append(link);
}
let menuHideTimer;
function openMenu(){
  clearTimeout(menuHideTimer);
  navigation.hidden=false;
  navigation.inert=false;
  menu.setAttribute('aria-expanded','true');
  navigation.getBoundingClientRect();
  navigation.classList.add('is-open');
}
function closeMenu(){
  if(navigation.hidden)return;
  menu.setAttribute('aria-expanded','false');
  navigation.classList.remove('is-open');
  navigation.inert=true;
  clearTimeout(menuHideTimer);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){navigation.hidden=true;return}
  menuHideTimer=setTimeout(()=>{if(menu.getAttribute('aria-expanded')==='false')navigation.hidden=true},600);
}
menu.onclick=()=>menu.getAttribute('aria-expanded')==='true'?closeMenu():openMenu();
document.addEventListener('click',e=>{if(!e.target.closest('.title-bar'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const dialog=$('#game-dialog');$('.computer-hotspot').setAttribute('aria-label',content.ui.gameLabel);$('.computer-hotspot').onclick=()=>{dialog.showModal();document.body.classList.add('modal-open')};text('#game-title',content.ui.gameTitle);text('#game-description',content.ui.gameDescription);text('.dialog-close',content.ui.close);$('.dialog-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

text('.skip-link',content.ui.skip);$('#projects').setAttribute('aria-label',content.ui.projectsLabel);$('.computer img').alt=content.ui.computerAlt;

text('#copyright',content.site.copyright);

function setupScrollReveals(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const targets=[];
  const add=(selector,variant,delay=0)=>{
    document.querySelectorAll(selector).forEach((element,index)=>{
      element.classList.add('reveal',variant);
      element.style.setProperty('--reveal-delay',`${typeof delay==='function'?delay(index):delay}ms`);
      targets.push(element);
    });
  };
  add('.hero','reveal-hero');
  add('.intro-copy','reveal-up',120);
  add('.project-card','reveal-card',index=>(index%3)*90);
  add('.expertise h2','reveal-up');
  add('.expertise-item','reveal-up',index=>index*110);
  add('.about-image','reveal-left');
  add('.about-copy','reveal-right',140);
  add('.contact h2','reveal-up');
  add('.contact-links','reveal-up',160);
  add('.site-footer','reveal-up');
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.documentElement.classList.add('motion-ready');
  targets.forEach(element=>observer.observe(element));
  document.addEventListener('focusin',event=>{
    const target=event.target.closest('.reveal');
    if(target){target.classList.add('is-visible');observer.unobserve(target)}
  });
}
setupScrollReveals();
