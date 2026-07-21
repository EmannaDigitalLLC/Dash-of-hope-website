/* ============================================================
   DASH OF HOPE — Site behavior
   Page routing, scroll reveals, counters, parallax, forms
   ============================================================ */

const navMap = {
  home:'nav-home', programs:'nav-programs', highschool:'nav-programs',
  juniorcollege:'nav-programs', orphancare:'nav-programs',
  donate:'nav-donate-link', about:'nav-about', contact:'nav-contact'
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(b=>{ if(!b.classList.contains('nav-donate')) b.classList.remove('active'); });
  const pg = document.getElementById('page-'+name);
  if(pg){ pg.classList.add('active'); }
  const navBtn = document.getElementById(navMap[name]);
  if(navBtn) navBtn.classList.add('active');

  closeMobileNav();
  window.scrollTo({top:0, behavior: reducedMotion ? 'auto' : 'smooth'});

  // reset + re-trigger reveal animations for the page just shown
  if(pg){
    pg.querySelectorAll('.reveal').forEach(el=>el.classList.remove('in-view'));
    pg.querySelectorAll('.count[data-target]').forEach(el=>{ el.dataset.done=''; el.textContent = el.dataset.prefix ? el.dataset.prefix+'0'+(el.dataset.suffix||'') : '0'+(el.dataset.suffix||''); });
    requestAnimationFrame(()=> observeReveals(pg));
  }
  history.replaceState(null, '', '#'+name);
}

function closeMobileNav(){
  const links = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if(links) links.classList.remove('open');
  if(toggle){ toggle.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
}

/* ---------- Scroll reveal via IntersectionObserver ---------- */
let revealObserver;
function getRevealObserver(){
  if(revealObserver) return revealObserver;
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        animateCounterIfNeeded(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  return revealObserver;
}

function observeReveals(scope){
  const root = scope || document;
  const obs = getRevealObserver();
  root.querySelectorAll('.reveal').forEach((el, i)=>{
    el.style.setProperty('--i', i % 8);
    obs.observe(el);
  });
  root.querySelectorAll('.count[data-target]').forEach(el=>obs.observe(el));
}

/* ---------- Animated counters ---------- */
function animateCounterIfNeeded(el){
  if(!el.classList.contains('count') || !el.dataset.target) return;
  if(el.dataset.done === '1') return;
  el.dataset.done = '1';
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals,10) : 0;
  const useLocale = el.dataset.locale === '1';
  const format = (n) => useLocale ? Math.round(n).toLocaleString('en-US') : n.toFixed(decimals);
  if(reducedMotion){
    el.textContent = prefix + format(target) + suffix;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent = prefix + format(val) + suffix;
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Subtle hero parallax ---------- */
function initParallax(){
  if(reducedMotion) return;
  const layers = document.querySelectorAll('.hero-bg, .page-hero-bg');
  if(!layers.length) return;
  let ticking = false;
  function update(){
    const y = window.scrollY;
    layers.forEach(layer=>{
      const rect = layer.closest('.hero, .page-hero').getBoundingClientRect();
      if(rect.bottom > 0 && rect.top < window.innerHeight){
        layer.style.transform = `translateY(${y * 0.12}px)`;
      }
    });
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive:true });
  update();
}

/* ---------- Donation tier selection ---------- */
function selectTier(el){
  el.closest('.tiers-grid').querySelectorAll('.tier-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  el.setAttribute('aria-pressed','true');
}

/* ---------- Contact form: client-side validation + mailto handoff ---------- */
function handleFormSubmit(e){
  e.preventDefault();
  const form = e.target;
  let valid = true;
  const first = form.querySelector('#cf-first');
  const last = form.querySelector('#cf-last');
  const email = form.querySelector('#cf-email');
  const message = form.querySelector('#cf-message');

  [ [first,'Please tell us your first name'], [last,'Please tell us your last name'],
    [email, 'Please enter a valid email address', true], [message, 'Let us know how we can help'] ]
  .forEach(([field, msg, isEmail])=>{
    const group = field.closest('.form-group');
    const ok = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()) : field.value.trim().length > 0;
    group.classList.toggle('invalid', !ok);
    group.querySelector('.form-error').textContent = msg;
    if(!ok) valid = false;
  });

  if(!valid){
    form.querySelector('.invalid input, .invalid textarea')?.focus();
    return;
  }

  const interest = form.querySelector('#cf-interest').value;
  const phone = form.querySelector('#cf-phone').value.trim();
  const btn = form.querySelector('.form-submit');

  const subject = encodeURIComponent(`Website inquiry: ${interest}`);
  const bodyLines = [
    `Name: ${first.value.trim()} ${last.value.trim()}`,
    `Email: ${email.value.trim()}`,
    phone ? `Phone: ${phone}` : null,
    `Interested in: ${interest}`,
    '',
    message.value.trim()
  ].filter(Boolean);
  const body = encodeURIComponent(bodyLines.join('\n'));

  btn.textContent = 'Opening your email app…';
  window.location.href = `mailto:contact@dashofhopecorp.org?subject=${subject}&body=${body}`;

  setTimeout(()=>{
    btn.textContent = '✓ Message ready to send';
    btn.style.background = 'var(--green)';
    setTimeout(()=>{ btn.textContent = 'Send Message →'; btn.style.background=''; }, 3500);
  }, 400);
}

/* ---------- Back to top ---------- */
function initBackToTop(){
  const btn = document.querySelector('.to-top');
  if(!btn) return;
  window.addEventListener('scroll', ()=>{
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive:true });
  btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior: reducedMotion ? 'auto' : 'smooth'}));
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', ()=>{
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* ---------- Video mute toggles ---------- */
function initVideoControls(){
  document.querySelectorAll('.mute-toggle').forEach(btn=>{
    const vid = btn.closest('.video-wrap, .donate-video-strip')?.querySelector('video');
    if(!vid) return;
    btn.addEventListener('click', ()=>{
      vid.muted = !vid.muted;
      btn.setAttribute('aria-pressed', String(!vid.muted));
      btn.innerHTML = vid.muted
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/></svg>';
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initMobileNav();
  initParallax();
  initBackToTop();
  initVideoControls();
  observeReveals(document.querySelector('.page.active'));

  const hash = window.location.hash.replace('#','');
  const valid = ['home','programs','highschool','juniorcollege','orphancare','donate','about','contact'];
  if(hash && valid.includes(hash)) showPage(hash);
});
