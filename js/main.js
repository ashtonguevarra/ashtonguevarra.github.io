// ===========================
// Theme
// ===========================
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Update the sun/moon icon
    toggle.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#293681' : '#D0E7E6');
    }
  }

  // Determine initial theme
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  setTheme(initial);

  // Toggle on click
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ===========================
// Navigation
// ===========================
function initNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');

  if (!menuToggle || !navLinks) return;

  function toggleMenu(open) {
    menuToggle.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close menu when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', () => toggleMenu(false));
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

  // Block Ctrl/Cmd + scroll zoom
  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // Block keyboard zoom shortcuts
  window.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["+", "-", "0", "="].includes(e.key)
    ) {
      e.preventDefault();
    }
  });

function highlightActivePage() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href ||
        (currentPath === '/' && href === '/') ||
        (currentPath.startsWith(href) && href !== '/')) {
      link.classList.add('active');
    } else if (currentPath === '/' && href === '/') {
      link.classList.add('active');
    }
  });
}

// ===========================
// Contact Form
// ===========================
function initForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    if (!data.name || !data.email || !data.message) {
      showFormMessage('Please fill in all fields before sending.', 'error');
      return;
    }

    if (!data.email.includes('@')) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showFormMessage('Thanks for reaching out! I\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showFormMessage(result.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showFormMessage('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function showFormMessage(msg, type) {
  const existing = document.querySelector('.form-message');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `form-message ${type}`;
  el.textContent = msg;
  el.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-top: 16px;
    ${type === 'success'
      ? 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;'
      : 'background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;'
    }
  `;

  document.getElementById('contact-form').appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ===========================
// Intersection Observer for fade-in
// ===========================
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// ===========================
// Blog — Dynamic listing
// ===========================
async function initBlogPage() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  const { loadBlogPosts } = await import('./blog.js');
  await loadBlogPosts(container);
}

// ===========================
// Typewriter Effect
// ===========================
function initTypewriter() {
  const els = document.querySelectorAll('[data-typewriter]');
  if (!els.length) return;

  els.forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';

    // Ghost span reserves the full-text space so layout never shifts
    const ghost = document.createElement('span');
    ghost.className = 'tw-ghost';
    ghost.textContent = text;
    el.appendChild(ghost);

    // Visible span where characters are typed, positioned absolutely over the ghost
    const visible = document.createElement('span');
    visible.className = 'tw-visible';
    el.appendChild(visible);

    let i = 0;
    const speed = parseInt(el.dataset.speed, 10) || 35;

    function type() {
      if (i < text.length) {
        visible.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        el.classList.add('done');
      }
    }

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      visible.textContent = text;
      el.classList.add('done');
      return;
    }

    // Start typing after a short delay (let the page settle)
    setTimeout(type, 400);
  });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  highlightActivePage();
  initForm();
  initScrollAnimations();
  initBlogPage();
  initTypewriter();
});

// ===========================
// Helpers
// ===========================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}