
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
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  highlightActivePage();
  initForm();
  initScrollAnimations();
  initBlogPage();
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

// hamburger nav links