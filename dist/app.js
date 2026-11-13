const grid = document.querySelector('#calendar-grid');
const busyDays = new Set([1, 2, 3, 7, 8, 9, 10, 11, 15, 16, 17]);
const heldDays = new Set([12, 13]);
let start = 22;
let end = 28;
let choosingEnd = false;
const buttons = new Map();
grid.append(document.createElement('span'));
for (let day = 1; day <= 31; day++) {
  const button = document.createElement('button');
  const state = busyDays.has(day) ? 'busy' : heldDays.has(day) ? 'hold' : 'free';
  button.type = 'button';
  button.textContent = day;
  button.className = `day ${state}`;
  button.disabled = state !== 'free';
  button.setAttribute('aria-label', `${day} декабря 2026 — ${state === 'busy' ? 'занято' : state === 'hold' ? 'HOLD на 48 часов' : 'свободно'}`);
  button.addEventListener('click', () => selectDay(day));
  buttons.set(day, button);
  grid.append(button);
}
function dateLabel() {
  const count = end - start + 1;
  const suffix = count === 1 ? 'день' : count < 5 ? 'дня' : 'дней';
  return `${start === end ? start : `${start}–${end}`} дек · ${count} ${suffix}`;
}
function renderSelection() {
  for (const [day, button] of buttons) {
    const selected = day >= start && day <= end;
    button.classList.toggle('selected', selected);
    if (!button.disabled) button.setAttribute('aria-pressed', String(selected));
  }
  document.querySelector('#selected-dates').textContent = dateLabel();
  document.querySelector('#selected-price').textContent = `${(end - start + 1) * 60} BYN (пример)`;
}
function selectDay(day) {
  if (!choosingEnd) {
    start = day;
    end = day;
    choosingEnd = true;
    document.querySelector('#calendar-feedback').textContent = 'Начальная дата выбрана. Выберите последнюю дату периода.';
  } else {
    const first = Math.min(start, day);
    const last = Math.max(start, day);
    for (let current = first; current <= last; current++) {
      if (busyDays.has(current) || heldDays.has(current)) {
        document.querySelector('#calendar-feedback').textContent = 'В этом периоде есть занятые даты. Выберите непрерывный свободный период.';
        openDialog('Выберите свободный период', 'В выбранном периоде есть занятые даты или HOLD. Выберите другой день окончания.');
        return;
      }
    }
    start = first;
    end = last;
    choosingEnd = false;
    document.querySelector('#calendar-feedback').textContent = `Выбрано: ${dateLabel()}.`;
  }
  renderSelection();
}
renderSelection();
const dialog = document.querySelector('#info-dialog');
function openDialog(title, content) {
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-content').textContent = content;
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
const messages = {
  region: ['Пилот в Минске', 'Сейчас на главной представлен пример рекламной поверхности в Минске. Другие регионы появятся после запуска.'],
  login: ['Вход в AD2AD', 'Личный кабинет будет доступен после подключения авторизации. Сейчас вы можете посмотреть главную страницу и выбрать даты в демонстрационном календаре.'],
  operator: ['Кабинет оператора', 'Кабинет оператора будет подключён на следующем этапе. Возможности для владельцев поверхностей представлены на главной странице.']
};
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(...messages[button.dataset.dialog])));
document.querySelectorAll('[data-request]').forEach(button => button.addEventListener('click', () => {
  openDialog(button.dataset.request === 'hold' ? 'Удержание дат на 48 часов' : 'Заявка на размещение', `Билборд 3×6, Минск\n${dateLabel()}\n${(end - start + 1) * 60} BYN (пример)\n\nЭто демонстрация календаря. Заявка не отправлена, даты не удерживаются. Отправка оператору будет доступна после подключения сервера.`);
}));
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuToggle.addEventListener('click', () => {
  const opened = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(opened));
});
navigation.querySelectorAll('a, button').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
