// ===========================
// Navigation
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  highlightActivePage();
});

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
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const currentScroll = window.scrollY;
    if (currentScroll > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
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
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Simple validation
    if (!data.name || !data.email || !data.message) {
      showFormMessage('Please fill in all fields.', 'error');
      return;
    }

    if (!data.email.includes('@')) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // For a static site, this just logs the submission
      // You can replace this with a form service like Formspree later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showFormMessage('Thanks for reaching out! I\'ll get back to you soon.', 'success');
      contactForm.reset();
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
    margin-top: 16px;
    ${type === 'success' 
      ? 'background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2);' 
      : 'background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);'
    }
  `;

  contactForm.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ===========================
// Intersection Observer for fade-in
// ===========================
if ('IntersectionObserver' in window) {
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