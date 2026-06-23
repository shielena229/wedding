// ===== Дата свадьбы =====
const WEDDING_DATE = new Date('2026-08-21T15:00:00+03:00');

// ===== Склонение числительных =====
function plural(n, forms) {
  // forms: [один, два-четыре, пять+] напр. ['день','дня','дней']
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

// ===== Таймер обратного отсчёта =====
const cd = {
  days: document.getElementById('cd-days'),
  hours: document.getElementById('cd-hours'),
  mins: document.getElementById('cd-mins'),
  secs: document.getElementById('cd-secs'),
  daysLbl: document.getElementById('cd-days-lbl'),
  hoursLbl: document.getElementById('cd-hours-lbl'),
  minsLbl: document.getElementById('cd-mins-lbl'),
  secsLbl: document.getElementById('cd-secs-lbl'),
};

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();

  if (diff <= 0) {
    cd.days.textContent = cd.hours.textContent = cd.mins.textContent = cd.secs.textContent = '0';
    document.querySelector('.countdown__title').textContent = 'Сегодня наш день!';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  cd.days.textContent = days;
  cd.hours.textContent = hours;
  cd.mins.textContent = mins;
  cd.secs.textContent = secs;

  cd.daysLbl.textContent = plural(days, ['день', 'дня', 'дней']);
  cd.hoursLbl.textContent = plural(hours, ['час', 'часа', 'часов']);
  cd.minsLbl.textContent = plural(mins, ['минута', 'минуты', 'минут']);
  cd.secsLbl.textContent = plural(secs, ['секунда', 'секунды', 'секунд']);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Календарь августа 2026 (Пн–Вс) =====
function buildCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const year = 2026, month = 7; // 7 = август (0-индекс)
  const target = 21;
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 31

  // День недели 1-го числа, понедельник = 0
  let firstDay = new Date(year, month, 1).getDay(); // 0=Вс
  firstDay = (firstDay + 6) % 7;

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar__day calendar__day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar__day';
    if (d === target) {
      cell.classList.add('calendar__day--target');
      cell.innerHTML = '<span>' + d + '</span>';
    } else {
      cell.textContent = d;
    }
    grid.appendChild(cell);
  }
}
buildCalendar();

// ===== Появление секций при скролле =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ===== Подсветка активной точки навигации =====
const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = e.target.id;
      dots.forEach((dot) => {
        dot.classList.toggle('is-active', dot.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.5 });
sections.forEach((s) => navObserver.observe(s));

// ===== Отправка анкеты =====
// Анкета отправляется классическим способом (обычный POST формы на FormSubmit) —
// это работает на любом устройстве и в любом браузере, без fetch/CORS.
// После отправки гость попадает на страницу «Спасибо» (см. _next в index.html).
// На кнопке показываем «Отправляем…», чтобы не нажимали дважды.
(function () {
  const rsvp = document.getElementById('rsvp-form');
  if (!rsvp) return;
  rsvp.addEventListener('submit', () => {
    const btn = rsvp.querySelector('.btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }
  });
})();

// ===== Анкета: напитки и трансфер показываем только тем, кто придёт =====
(function () {
  const attendeeOnly = document.getElementById('attendee-only');
  if (!attendeeOnly) return;
  const rsvpForm = document.getElementById('rsvp-form');
  const transferRadios = document.querySelectorAll('input[name="Трансфер"]');

  function updateAttendee() {
    const sel = document.querySelector('input[name="Присутствие"]:checked');
    // вопросы показываем всем, КРОМЕ тех, кто точно не придёт
    const showQuestions = !!sel && sel.value !== 'Не смогу прийти';
    attendeeOnly.hidden = !showQuestions;
    transferRadios.forEach((r) => { r.required = showQuestions; });
    if (!showQuestions) {
      // «Не смогу прийти» — убираем лишние ответы, чтобы не уходили в письмо
      document
        .querySelectorAll('input[name="Напитки[]"]:checked, input[name="Трансфер"]:checked')
        .forEach((i) => { i.checked = false; });
    }
  }

  document.querySelectorAll('input[name="Присутствие"]').forEach((r) => {
    r.addEventListener('change', updateAttendee);
  });
  // после успешной отправки форма сбрасывается — вернуть блок в скрытое состояние
  if (rsvpForm) rsvpForm.addEventListener('reset', () => setTimeout(updateAttendee, 0));
  updateAttendee();
})();
