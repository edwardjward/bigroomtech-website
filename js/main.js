// NAV scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
}

// Newsletter form
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = newsletterForm.querySelector('button');
    const formData = new FormData(newsletterForm);
    fetch('/', { method: 'POST', body: formData })
      .then(() => {
        btn.textContent = 'Subscribed! ✓';
        btn.disabled = true;
        newsletterForm.querySelector('input[type="email"]').value = '';
        setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; }, 3000);
      })
      .catch(() => { btn.textContent = 'Error — try again'; });
  });
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    fetch('/', { method: 'POST', body: formData })
      .then(() => {
        btn.textContent = 'Message sent! ✓';
        btn.disabled = true;
        contactForm.reset();
        setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; }, 4000);
      })
      .catch(() => { btn.textContent = 'Error — try again'; });
  });
}

// Fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .client-card, .blog-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
