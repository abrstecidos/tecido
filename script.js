const form = document.getElementById('abrsForm');
const steps = [...document.querySelectorAll('.form-step')];
const stepLabel = document.getElementById('stepLabel');
const stepTitle = document.getElementById('stepTitle');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const errorEl = document.getElementById('formError');
const liveSummary = document.getElementById('liveSummary');

const menuButton = document.getElementById('menuButton');
const menuPanel = document.getElementById('menuPanel');
const menuClose = document.getElementById('menuClose');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuLinks = [...document.querySelectorAll('[data-menu-link]')];
const materialMenuLinks = [...document.querySelectorAll('[data-wa-material]')];

const WHATSAPP_NUMBER = '5511994724695';
let currentStep = 1;

function getSingle(name) {
  const field = form.elements[name];
  return field?.value?.trim?.() || '';
}

function getMulti(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function validate(step) {
  errorEl.textContent = '';

  const rules = {
    1: [Boolean(getSingle('purchaseType')), 'Escolha como você pretende comprar para continuar.'],
    2: [getMulti('materials').length > 0, 'Selecione pelo menos um material de interesse.'],
    3: [Boolean(getSingle('quantity')), 'Selecione uma faixa aproximada de quantidade.'],
    4: [Boolean(getSingle('name')) && Boolean(getSingle('city')), 'Preencha seu nome e sua cidade / UF.']
  };

  const [ok, message] = rules[step] || [true, ''];
  if (!ok) errorEl.textContent = message;
  return ok;
}

function truncate(text, max = 44) {
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function updateLiveSummary() {
  const values = [
    getSingle('purchaseType'),
    getMulti('materials').join(', '),
    getSingle('quantity')
  ];

  [...liveSummary.querySelectorAll('strong')].forEach((el, index) => {
    el.textContent = truncate(values[index]);
  });
}

function renderStep({ scroll = false, focus = false } = {}) {
  steps.forEach((step, index) => (step.classList.toggle('is-active', index + 1 === currentStep), step.hidden = index + 1 !== currentStep));

  const active = steps[currentStep - 1];
  const percentage = Math.round((currentStep / steps.length) * 100);

  stepLabel.textContent = `${currentStep} de ${steps.length}`;
  stepTitle.textContent = active.dataset.title || '';
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;

  prevBtn.disabled = currentStep === 1;
  nextBtn.classList.toggle('is-hidden', currentStep === steps.length);
  submitBtn.classList.toggle('is-hidden', currentStep !== steps.length);
  errorEl.textContent = '';
  updateLiveSummary();
  active.querySelector('h3').setAttribute('tabindex', '-1');
  if (focus) active.querySelector('h3').focus({preventScroll:true});

  if (scroll) {
    document.getElementById('central').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

nextBtn.addEventListener('click', () => {
  if (!validate(currentStep)) return;
  currentStep = Math.min(currentStep + 1, steps.length);
  renderStep({ focus: true });
});

prevBtn.addEventListener('click', () => {
  currentStep = Math.max(currentStep - 1, 1);
  renderStep({ focus: true });
});

form.addEventListener('change', () => {
  errorEl.textContent = '';
  updateLiveSummary();
});
form.addEventListener('input', updateLiveSummary);

function getOrigin() {
  const params = new URLSearchParams(window.location.search);
  return params.get('origem') || params.get('utm_source') || '';
}

function buildMaterialWhatsAppUrl(material) {
  const origin = getOrigin();
  const message = [
    'Olá, Daniel! 👋',
    '',
    `Vim pelo site da ABRS Tecidos e tenho interesse em *${material}*.`,
    'Pode me mostrar as opções disponíveis, valores e condições?',
    ...(origin ? ['', `Origem: ${origin}`] : [])
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

materialMenuLinks.forEach((link) => {
  link.href = buildMaterialWhatsAppUrl(link.dataset.waMaterial);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validate(steps.length)) return;

  const profile = getSingle('purchaseType');
  const purchase = profile === 'Ainda estou avaliando'
    ? 'a princípio ainda estou avaliando a forma de compra'
    : `a princípio no ${profile.toLocaleLowerCase('pt-BR')}`;
  const message = [
    'Fala Daniel ! 👋',
    '',
    `Me chamo ${getSingle('name')} e sou aqui de ${getSingle('city')}.`,
    `Gostaria de comprar ${getMulti('materials').join(', ')}, ${purchase} (quantidade aproximada: ${getSingle('quantity')}).`,
    '',
    'Pode me mostrar o que vocês têm disponível e os valores?',
    ...(getSingle('company') ? ['', `Empresa / ateliê: ${getSingle('company')}`] : []),
    ...(getSingle('notes') ? ['', `Observação: ${getSingle('notes')}`] : [])
  ].join('\n');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

function openMenu() {
  menuPanel.classList.add('is-open');
  menuPanel.setAttribute('aria-hidden', 'false');
  menuButton.setAttribute('aria-expanded', 'true');
  menuBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  menuPanel.inert = false;
  menuClose.focus();
}

function closeMenu() {
  menuPanel.classList.remove('is-open');
  menuPanel.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-expanded', 'false');
  menuBackdrop.hidden = true;
  document.body.style.overflow = '';
  menuPanel.inert = true;
  menuButton.focus();
}

menuButton.addEventListener('click', () => {
  menuPanel.classList.contains('is-open') ? closeMenu() : openMenu();
});
menuClose.addEventListener('click', closeMenu);
menuBackdrop.addEventListener('click', closeMenu);
menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

renderStep();

menuPanel.inert = true;
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-category]').forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-pressed', String(selected));
    document.getElementById(tab.dataset.category).hidden = !selected;
  });
}));
menuPanel.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const items = [...menuPanel.querySelectorAll('a[href],button')];
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
