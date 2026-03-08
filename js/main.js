const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;

const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouch) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx-5}px,${my-5}px)`;
  });

  (function animRing(){
    rx += (mx - rx - 18) * 0.12;
    ry += (my - ry - 18) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animRing);
  })();
}

// Hamburger menu
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

if (!isTouch) {
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter',()=>{ ring.style.width='52px'; ring.style.height='52px'; ring.style.borderColor='rgba(0,212,255,0.8)'; });
    el.addEventListener('mouseleave',()=>{ ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(0,212,255,0.5)'; });
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
  });
}, {threshold:0.1});

document.querySelectorAll('.project-card,.t-card,.tl,.about-grid,.contact-layout,.exp-badge').forEach(el => {
  el.style.opacity='0';
  el.style.transform='translateY(28px)';
  el.style.transition='opacity 0.7s ease, transform 0.7s ease';
  io.observe(el);
});