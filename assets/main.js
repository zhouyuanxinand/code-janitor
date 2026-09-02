// nav border on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// per-row copy buttons
document.querySelectorAll('button[data-cmd]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const cmd = btn.getAttribute('data-cmd');
    try {
      await navigator.clipboard.writeText(cmd);
      const t = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => (btn.textContent = t), 1600);
    } catch {
      btn.textContent = 'select ↑';
    }
  });
});
