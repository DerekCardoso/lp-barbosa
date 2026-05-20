/* ── Navbar scroll ───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Reveal on scroll ────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

/* ── Envio do formulário via AJAX (sem redirecionar) ─────────── */
const form        = document.getElementById('contact-form');
const successBox  = document.getElementById('form-success');
const successName = document.getElementById('form-success-name');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Enviando…';

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        /* Personaliza a mensagem com o nome digitado */
        const nomeInput = form.querySelector('#nome');
        if (nomeInput && nomeInput.value.trim()) {
          const primeiroNome = nomeInput.value.trim().split(' ')[0];
          successName.textContent = primeiroNome + '.';
        } else {
          successName.textContent = '';
        }

        /* Troca o formulário pela mensagem */
        form.style.transition   = 'opacity .4s ease';
        form.style.opacity      = '0';
        setTimeout(() => {
          form.hidden             = true;
          successBox.hidden       = false;
          successBox.style.opacity = '0';
          successBox.style.transition = 'opacity .5s ease';
          requestAnimationFrame(() => {
            successBox.style.opacity = '1';
          });
        }, 400);

      } else {
        /* Erro retornado pelo Formspree */
        btn.disabled    = false;
        btn.textContent = 'Solicitar diagnóstico';
        alert('Algo deu errado. Por favor, tente novamente.');
      }
    } catch {
      btn.disabled    = false;
      btn.textContent = 'Solicitar diagnóstico';
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  });
}
