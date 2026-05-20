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

function showFieldError(container, msg) {
  const span = document.createElement('span');
  span.className = 'form-error';
  span.textContent = msg;
  container.appendChild(span);
}

function validateForm() {
  form.querySelectorAll('.form-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  let valid = true;
  const seen = new Set();

  form.querySelectorAll('[required]').forEach(field => {
    if (field.type === 'radio') {
      if (seen.has(field.name)) return;
      seen.add(field.name);
      if (!form.querySelector(`[name="${field.name}"]:checked`)) {
        valid = false;
        showFieldError(field.closest('.radio-group'), 'Selecione uma opção');
      }
    } else if (field.tagName === 'SELECT') {
      if (!field.value) {
        valid = false;
        field.classList.add('input-error');
        showFieldError(field.closest('.form-group'), 'Selecione uma opção');
      }
    } else {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('input-error');
        showFieldError(field.closest('.form-group'), 'Campo obrigatório');
      }
    }
  });

  if (!valid) {
    const first = form.querySelector('.input-error, .form-error');
    if (first) first.closest('.form-group, .radio-group')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

if (form) {
  /* Limpa erro do campo ao interagir */
  form.querySelectorAll('input, select').forEach(field => {
    ['input', 'change'].forEach(evt => {
      field.addEventListener(evt, () => {
        field.classList.remove('input-error');
        field.closest('.form-group, .radio-group')?.querySelector('.form-error')?.remove();
      });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
