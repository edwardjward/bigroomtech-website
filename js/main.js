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

// Consultant application form (/join)
const applyForm = document.getElementById('applyForm');
if (applyForm) {
  const errorEl = document.getElementById('applyError');
  const successEl = document.getElementById('applySuccess');
  const cvInput = document.getElementById('cv');
  const MAX_MB = 5;

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const clearError = () => { errorEl.hidden = true; errorEl.textContent = ''; };

  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    // Required-field check (covers all fields marked required)
    const required = applyForm.querySelectorAll('[required]');
    for (const el of required) {
      if (!el.value || (el.type === 'file' && !el.files.length)) {
        showError('Please fill out all required fields.');
        el.focus();
        return;
      }
    }

    // Email format
    const emailVal = applyForm.querySelector('#email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showError('Please enter a valid email address.');
      return;
    }

    // LinkedIn URL sanity
    const linkedinVal = applyForm.querySelector('#linkedin').value.trim();
    if (!/^https?:\/\/(www\.)?linkedin\.com\//i.test(linkedinVal)) {
      showError('Please enter a valid LinkedIn profile URL (starting with https://www.linkedin.com/).');
      return;
    }

    // CV: PDF only + size limit
    const file = cvInput.files[0];
    if (file) {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!isPdf) {
        showError('CV must be a PDF file.');
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        showError(`CV must be ${MAX_MB}MB or smaller.`);
        return;
      }
    }

    const btn = applyForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    fetch('/', { method: 'POST', body: new FormData(applyForm) })
      .then((res) => {
        if (!res.ok) throw new Error('Submission failed');
        applyForm.hidden = true;
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        showError('Something went wrong. Please try again or email info@bigroomtech.com.');
      });
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
