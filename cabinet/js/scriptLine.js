// scriptLine.js
import { procurementData, getFilteredPurchases, STATUSES } from './scriptTable.js';

// Константы для графика - только нужные статусы
const VISIBLE_STATUSES = ["В процессе", "На согласовании", "Завершено"];

const STATUS_COLORS = {
  "В процессе": "#4A6FFF",
  "На согласовании": "#00a0c8",
  "Завершено": "#0a857e"
};

// Глобальные переменные для графика
let currentPeriod = 'week'; // По умолчанию последняя неделя
let currentChartData = null;
let customDateRange = {
  start: null,
  end: null
};

// Главная функция инициализации графика
function initChart() {
  console.log('Инициализация графика...');

  // Проверяем, существует ли контейнер для графика
  const chartContainer = document.getElementById('up');
  if (!chartContainer) {
    console.error('Контейнер для графика не найден');
    return;
  }

  initializeChartButtons();
  renderChart();
}

// Инициализация при полной загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChart);
} else {
  // Если таблица уже загружена, инициализируем график
  setTimeout(initChart, 100);
}

// Инициализация кнопок периода для графика
function initializeChartButtons() {
  const rangePanel = document.querySelector('.range-panel__buttons');
  if (!rangePanel) return;

  const periodButtons = rangePanel.querySelectorAll('.btn--outline');

  // Устанавливаем активную кнопку (последние 7 дней)
  periodButtons.forEach(btn => {
    btn.classList.remove('btn-active');
  });

  const weekButton = document.getElementById('week');
  if (weekButton) {
    weekButton.classList.add('btn-active');
  }

  periodButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Удаляем активный класс у всех кнопок
      periodButtons.forEach(btn => {
        btn.classList.remove('btn-active');
      });

      // Добавляем активный класс текущей кнопке
      this.classList.add('btn-active');

      // Устанавливаем текущий период
      currentPeriod = this.id;

      // Скрываем календарь если он был открыт
      hideDatePicker();

      // Перестраиваем график
      renderChart();
    });
  });

  // Особый обработчик для кнопки "Задать интервал"
  const timeButton = document.getElementById('time');
  if (timeButton) {
    timeButton.addEventListener('click', function () {
      // Удаляем активный класс у всех кнопок
      periodButtons.forEach(btn => {
        btn.classList.remove('btn-active');
      });

      // Добавляем активный класс текущей кнопке
      this.classList.add('btn-active');

      // Устанавливаем текущий период
      currentPeriod = 'time';

      // Показываем календарь
      showDatePicker();
    });
  }

  // Обработчик для кнопки "Показать"
  const showButton = document.querySelector('.btn--primary.btn--wide');
  if (showButton) {
    showButton.addEventListener('click', function () {
      renderChart();
    });
  }
}

// Показать календарь для выбора интервала
function showDatePicker() {
  let datePicker = document.querySelector('.date-picker');

  if (!datePicker) {
    datePicker = document.createElement('div');
    datePicker.className = 'date-picker';

    // Устанавливаем даты по умолчанию (последние 30 дней)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    datePicker.innerHTML = `
      <div class="date-picker__container">
        <div class="date-picker__title">Выберите интервал</div>
        <div class="date-picker__inputs">
          <div class="date-picker__input-group">
            <label for="startDate">С:</label>
            <input type="date" id="startDate" class="date-input" value="${startDate.toISOString().split('T')[0]}">
          </div>
          <div class="date-picker__input-group">
            <label for="endDate">По:</label>
            <input type="date" id="endDate" class="date-input" value="${endDate.toISOString().split('T')[0]}">
          </div>
          <button class="btn btn--primary" id="applyDate">Применить</button>
          <button class="btn btn--outline btn--del" id="cancelDate">Отмена</button>
        </div>
      </div>
    `;

    // Вставляем после кнопок периода
    const rangePanel = document.querySelector('.range-panel');
    if (rangePanel) {
      rangePanel.appendChild(datePicker);
    }

    // Инициализируем обработчики
    document.getElementById('applyDate').addEventListener('click', function () {
      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');

      if (startInput.value && endInput.value) {
        customDateRange.start = new Date(startInput.value);
        customDateRange.end = new Date(endInput.value);

        if (customDateRange.start <= customDateRange.end) {
          renderChart();
          hideDatePicker();
        } else {
          alert('Дата начала должна быть раньше даты окончания');
        }
      } else {
        alert('Выберите обе даты');
      }
    });

    document.getElementById('cancelDate').addEventListener('click', function () {
      hideDatePicker();
      // Возвращаемся к недельному графику
      const weekButton = document.getElementById('week');
      if (weekButton) {
        weekButton.click();
      }
    });
  }

  datePicker.style.display = 'block';
}

// Скрыть календарь
function hideDatePicker() {
  const datePicker = document.querySelector('.date-picker');
  if (datePicker) {
    datePicker.style.display = 'none';
  }
}

// Получение данных для графика
function getChartData() {
  // Используем функцию из scriptTable.js
  if (typeof getFilteredPurchases !== 'function') {
    console.error('Функция getFilteredPurchases не найдена');
    return [];
  }

  const purchases = getFilteredPurchases();

  // Определяем период для графика
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let intervals = [];
  let labels = [];

  switch (currentPeriod) {
    case 'day':
      // 1 день, показываем по часам
      startDate.setDate(now.getDate() - 1);
      intervals = generateHourIntervals(startDate, endDate);
      labels = intervals.map(d => `${new Date(d).getHours()}:00`);
      break;

    case 'week':
      // 7 дней, показываем по дням
      startDate.setDate(now.getDate() - 7);
      intervals = generateDayIntervals(startDate, endDate);
      labels = intervals.map(d => {
        const date = new Date(d);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
      });
      break;

    case 'mouns':
      // 30 дней, показываем по дням
      startDate.setDate(now.getDate() - 30);
      intervals = generateDayIntervals(startDate, endDate, 30);
      labels = intervals.map(d => {
        const date = new Date(d);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
      });
      break;

    case 'quatro':
      // 90 дней, показываем по неделям (примерно 13 недель)
      startDate.setDate(now.getDate() - 90);
      intervals = generateWeekIntervals(startDate, endDate);
      labels = intervals.map(d => {
        const date = new Date(d);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
      });
      break;

    case 'year':
      // 365 дней, показываем 12 месяцев
      startDate.setDate(now.getDate() - 365);
      intervals = generateMonthIntervals(startDate, endDate);
      labels = intervals.map((d, i) => {
        const date = new Date(d);
        const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        return monthNames[date.getMonth()];
      });
      break;

    case 'time':
      // Кастомный интервал, показываем по дням
      if (customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start);
        endDate = new Date(customDateRange.end);

        // Ограничиваем разницу максимум 365 днями
        const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
          alert('Интервал не должен превышать 365 дней');
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 365);
        }

        intervals = generateDayIntervals(startDate, endDate);
        labels = intervals.map(d => {
          const date = new Date(d);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${day}.${month}`;
        });
      } else {
        // По умолчанию 30 дней
        startDate.setDate(now.getDate() - 30);
        intervals = generateDayIntervals(startDate, endDate);
        labels = intervals.map(d => {
          const date = new Date(d);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${day}.${month}`;
        });
      }
      break;
  }

  // Обновляем мета-информацию об интервале
  updateRangeMeta(startDate, endDate);

  // Инициализируем данные для графика
  const chartData = [];
  const statusTotals = {};

  // Используем только видимые статусы
  VISIBLE_STATUSES.forEach(status => {
    statusTotals[status] = new Array(intervals.length).fill(0);
  });

  // Заполняем данные из закупок
  purchases.forEach(purchase => {
    const purchaseDate = parseDateToTimestamp(purchase.date);
    if (!purchaseDate) return;

    const amount = parseInt(purchase.amount) || 0;
    const status = purchase.status;

    // Пропускаем ненужные статусы
    if (!VISIBLE_STATUSES.includes(status)) {
      return;
    }

    // Находим индекс интервала для этого заказа
    let intervalIndex = findIntervalIndex(purchaseDate, intervals, currentPeriod);

    // Если нашли соответствующий интервал и статус нужный
    if (intervalIndex !== -1 && statusTotals[status]) {
      // Накопительная сумма - добавляем к предыдущим значениям
      for (let i = intervalIndex; i < intervals.length; i++) {
        statusTotals[status][i] += amount;
      }
    }
  });

  // Формируем финальные данные для графика
  intervals.forEach((interval, index) => {
    const dataPoint = {
      date: interval,
      label: labels[index]
    };

    VISIBLE_STATUSES.forEach(status => {
      dataPoint[status] = statusTotals[status][index] || 0;
    });

    chartData.push(dataPoint);
  });

  currentChartData = chartData;
  return chartData;
}

// Генерация интервалов по часам
function generateHourIntervals(startDate, endDate) {
  const intervals = [];
  const current = new Date(startDate);

  // Округляем до начала часа
  current.setMinutes(0, 0, 0);

  while (current <= endDate) {
    intervals.push(current.getTime());
    current.setHours(current.getHours() + 1);
  }

  return intervals;
}

// Генерация интервалов по дням
function generateDayIntervals(startDate, endDate, maxDays = null) {
  const intervals = [];
  const current = new Date(startDate);

  // Округляем до начала дня
  current.setHours(0, 0, 0, 0);

  let dayCount = 0;
  while (current <= endDate && (!maxDays || dayCount < maxDays)) {
    intervals.push(current.getTime());
    current.setDate(current.getDate() + 1);
    dayCount++;
  }

  return intervals;
}

// Генерация интервалов по неделям
function generateWeekIntervals(startDate, endDate) {
  const intervals = [];
  const current = new Date(startDate);

  // Округляем до начала недели (понедельник)
  current.setDate(current.getDate() - current.getDay() + 1);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    intervals.push(current.getTime());
    current.setDate(current.getDate() + 7);
  }

  return intervals;
}

// Генерация интервалов по месяцам (12 месяцев для года)
function generateMonthIntervals(startDate, endDate) {
  const intervals = [];
  const current = new Date(startDate);

  // Округляем до начала месяца
  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  // Генерируем 12 интервалов
  for (let i = 0; i < 12; i++) {
    intervals.push(current.getTime());
    current.setMonth(current.getMonth() + 1);
  }

  return intervals;
}

// Нахождение индекса интервала для даты покупки
function findIntervalIndex(purchaseTimestamp, intervals, period) {
  const purchaseDate = new Date(purchaseTimestamp);

  for (let i = 0; i < intervals.length; i++) {
    const intervalDate = new Date(intervals[i]);

    switch (period) {
      case 'day':
        // Для дня сравниваем часы
        if (purchaseDate.getDate() === intervalDate.getDate() &&
          purchaseDate.getMonth() === intervalDate.getMonth() &&
          purchaseDate.getFullYear() === intervalDate.getFullYear() &&
          purchaseDate.getHours() === intervalDate.getHours()) {
          return i;
        }
        break;

      case 'year':
        // Для года сравниваем месяцы
        if (purchaseDate.getMonth() === intervalDate.getMonth() &&
          purchaseDate.getFullYear() === intervalDate.getFullYear()) {
          return i;
        }
        break;

      default:
        // Для остальных периодов сравниваем дни
        if (purchaseDate.getDate() === intervalDate.getDate() &&
          purchaseDate.getMonth() === intervalDate.getMonth() &&
          purchaseDate.getFullYear() === intervalDate.getFullYear()) {
          return i;
        }
    }
  }

  return -1;
}

// Парсинг даты в timestamp (дублируем для независимости)
function parseDateToTimestamp(dateStr) {
  if (!dateStr) return 0;

  // Формат DD.MM.YYYY
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(year, month, day).getTime();
  }

  return 0;
}

// Обновление мета-информации об интервале
function updateRangeMeta(startDate, endDate) {
  const metaElement = document.querySelector('.range-panel__meta');
  if (!metaElement) return;

  if (currentPeriod === 'time' && customDateRange.start && customDateRange.end) {
    const startStr = formatDateForDisplay(customDateRange.start);
    const endStr = formatDateForDisplay(customDateRange.end);
    metaElement.textContent = `Интервал ${startStr} - ${endStr}`;
  } else {
    const startStr = formatDateForDisplay(startDate);
    const endStr = formatDateForDisplay(endDate);
    metaElement.textContent = `Интервал ${startStr} - ${endStr}`;
  }
}

// Форматирование даты для отображения
function formatDateForDisplay(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}.${month}.${year}`;
}

// Форматирование суммы в кратком виде (дублируем для независимости)
function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K';
  }
  return amount.toString();
}

// Отрисовка графика с легендой под графиком
function renderChart() {
  const chartContainer = document.getElementById('up');
  if (!chartContainer) return;

  const chartData = getChartData();

  // Очищаем контейнер
  chartContainer.innerHTML = '';

  if (chartData.length === 0) {
    chartContainer.innerHTML = '<div class="no-data">Нет данных для отображения</div>';
    return;
  }

  // Создаем canvas для графика
  const canvas = document.createElement('canvas');
  canvas.id = 'incomeChart';
  canvas.style.width = '100%';
  canvas.style.height = '280px';
  canvas.width = chartContainer.clientWidth;
  canvas.height = 280;
  
  // Адаптивная высота для мобильных
  if (window.innerWidth <= 768) {
    canvas.style.height = '220px';
    canvas.height = 220;
  }
  
  if (window.innerWidth <= 480) {
    canvas.style.height = '180px';
    canvas.height = 180;
  }
  
  chartContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Настройки графика (адаптивные)
  let padding = { top: 40, right: 30, bottom: 50, left: 80 };
  
  // Уменьшаем отступы для мобильных
  if (window.innerWidth <= 768) {
    padding = { top: 30, right: 20, bottom: 40, left: 60 };
  }
  
  if (window.innerWidth <= 480) {
    padding = { top: 20, right: 15, bottom: 35, left: 50 };
  }
  
  const graphWidth = canvas.width - padding.left - padding.right;
  const graphHeight = canvas.height - padding.top - padding.bottom;

  // Находим максимальное значение для масштабирования
  let maxValue = 0;
  chartData.forEach(point => {
    VISIBLE_STATUSES.forEach(status => {
      if (point[status] > maxValue) maxValue = point[status];
    });
  });

  // Если все значения 0, устанавливаем максимальное значение для отображения
  if (maxValue === 0) maxValue = 100000;

  // Функция для преобразования значения в координаты Y
  const scaleY = value => padding.top + graphHeight - (value / maxValue) * graphHeight;

  // Функция для преобразования индекса в координаты X
  const scaleX = index => padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;

  // Рисуем фон
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем оси
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, canvas.height - padding.bottom);
  ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Подписи осей (адаптивные шрифты)
  let fontSize = window.innerWidth <= 480 ? 10 : window.innerWidth <= 768 ? 12 : 14;
  let smallFontSize = window.innerWidth <= 480 ? 8 : window.innerWidth <= 768 ? 10 : 12;
  
  ctx.fillStyle = '#374151';
  ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('время', (canvas.width - padding.right + padding.left) / 2, canvas.height - 10);

  ctx.save();
  ctx.translate(20, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('вложения ₽', 0, 0);
  ctx.restore();

  // Сетка и подписи на оси Y
  ctx.font = `${smallFontSize}px TT Fors, Inter, Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B7280';

  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const value = (maxValue / ySteps) * i;
    const y = scaleY(value);

    // Горизонтальные линии сетки
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(canvas.width - padding.right, y);
    ctx.strokeStyle = '#F3F4F6';
    ctx.stroke();

    // Подписи на оси Y
    ctx.fillText(formatCurrencyShort(value), padding.left - 10, y + 4);
  }

  // Подписи на оси X
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(chartData.length / (window.innerWidth <= 480 ? 5 : window.innerWidth <= 768 ? 8 : 10)));

  chartData.forEach((point, index) => {
    const x = scaleX(index);

    // Вертикальные линии сетки (только для некоторых интервалов)
    if (index % step === 0 || index === chartData.length - 1) {
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, canvas.height - padding.bottom);
      ctx.strokeStyle = '#F3F4F6';
      ctx.stroke();

      // Подписи на оси X
      ctx.fillText(point.label, x, canvas.height - padding.bottom + 15);
    }
  });

  // Рисуем графики для каждого видимого статуса
  VISIBLE_STATUSES.forEach(status => {
    ctx.beginPath();
    ctx.lineWidth = window.innerWidth <= 480 ? 1 : 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    chartData.forEach((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point[status]);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = STATUS_COLORS[status];
    ctx.stroke();

    // Добавляем точки (только в ключевых местах)
    chartData.forEach((point, index) => {
      if (index % step === 0 || index === chartData.length - 1) {
        const x = scaleX(index);
        const y = scaleY(point[status]);

        ctx.beginPath();
        ctx.arc(x, y, window.innerWidth <= 480 ? 2 : 2, 0, Math.PI * 2);
        ctx.fillStyle = STATUS_COLORS[status];
        ctx.fill();
      }
    });
  });

  // Создаем отдельный контейнер для легенды под графиком
  createLegendContainer(chartContainer, chartData);
}

// Создание контейнера для легенды под графиком
function createLegendContainer(chartContainer, chartData) {
  const legendContainer = document.createElement('div');
  legendContainer.className = 'chart-legend';

  // Считаем общую сумму
  let totalSum = 0;
  if (chartData.length > 0) {
    const lastDataPoint = chartData[chartData.length - 1];
    VISIBLE_STATUSES.forEach(status => {
      totalSum += lastDataPoint[status] || 0;
    });
  }

  // Создаем элементы легенды
  VISIBLE_STATUSES.forEach(status => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = STATUS_COLORS[status];

    const textContainer = document.createElement('div');
    textContainer.className = 'legend-text';

    const statusName = document.createElement('span');
    statusName.className = 'legend-name';
    
    let statusText = status;
    if (status === "В процессе") statusText = "Процесс";
    if (status === "На согласовании") statusText = "Согласование";
    if (status === "Завершено") statusText = "Завершено";
    statusName.textContent = statusText;

    const valueElement = document.createElement('span');
    valueElement.className = 'legend-value';

    const lastValue = chartData.length > 0 ? chartData[chartData.length - 1][status] : 0;
    valueElement.textContent = formatCurrencyShort(lastValue);

    textContainer.appendChild(statusName);
    textContainer.appendChild(valueElement);
    legendItem.appendChild(colorBox);
    legendItem.appendChild(textContainer);
    legendContainer.appendChild(legendItem);
  });

  // Добавляем элемент с общей суммой
  const totalItem = document.createElement('div');
  totalItem.className = 'legend-total';

  const totalLabel = document.createElement('span');
  totalLabel.className = 'legend-total-label';
  totalLabel.textContent = 'Всего:';

  const totalValue = document.createElement('span');
  totalValue.className = 'legend-total-value';
  totalValue.textContent = formatCurrencyShort(totalSum);

  totalItem.appendChild(totalLabel);
  totalItem.appendChild(totalValue);
  legendContainer.appendChild(totalItem);

  chartContainer.appendChild(legendContainer);
}

// Инициализация при изменении размера окна
window.addEventListener('resize', function () {
  const chartContainer = document.getElementById('up');
  if (chartContainer) {
    renderChart();
  }
});

// Экспортируем функции для обновления
export function updateChart() {
  renderChart();
}