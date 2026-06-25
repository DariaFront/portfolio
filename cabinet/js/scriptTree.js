// scriptTree.js
import { procurementData, getFilteredPurchases, STATUSES } from './scriptTable.js';

// Группировка статусов для диаграммы
const STATUS_GROUPS = {
    "Активные заявки": ["В процессе", "Ожидается"],
    "На согласовании": ["На согласовании"],
    "Требует внимания": ["Просрочено"],
    "Завершено": ["Завершено"]
};

// Цвета для столбцов
const GROUP_COLORS = {
    "Активные заявки": "#4A6FFF", // синий
    "На согласовании": "#00a0c8", // голубой
    "Требует внимания": "#c9c180", // желтый
    "Завершено": "#0a857e" // зеленый
};

// Главная функция инициализации диаграммы
function initTreeChart() {
    console.log('Инициализация столбчатой диаграммы...');

    // Проверяем, существует ли контейнер для диаграммы
    const chartContainer = document.querySelector('.chart-info');
    if (!chartContainer) {
        console.error('Контейнер для диаграммы не найден');
        return;
    }

    renderTreeChart();
}

// Инициализация при полной загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTreeChart);
} else {
    // Если таблица уже загружена, инициализируем диаграмму
    setTimeout(initTreeChart, 100);
}

// Получение данных для диаграммы
function getTreeChartData() {
    // Используем функцию из scriptTable.js
    if (typeof getFilteredPurchases !== 'function') {
        console.error('Функция getFilteredPurchases не найдена');
        return null;
    }

    const purchases = getFilteredPurchases();

    // Инициализируем структуру данных
    const chartData = {
        groups: Object.keys(STATUS_GROUPS),
        sums: {},
        counts: {}
    };

    // Инициализируем нулями
    chartData.groups.forEach(group => {
        chartData.sums[group] = 0;
        chartData.counts[group] = 0;
    });

    // Собираем данные
    purchases.forEach(purchase => {
        const amount = parseInt(purchase.amount) || 0;
        const status = purchase.status;

        // Находим группу для этого статуса
        let groupAssigned = false;

        for (const [groupName, statuses] of Object.entries(STATUS_GROUPS)) {
            if (statuses.includes(status)) {
                chartData.sums[groupName] += amount;
                chartData.counts[groupName] += 1;
                groupAssigned = true;
                break;
            }
        }

        // Если статус не попал ни в одну группу, добавляем его в "Активные заявки"
        if (!groupAssigned) {
            console.warn(`Статус "${status}" не найден в группах, добавляем в "Активные заявки"`);
            chartData.sums["Активные заявки"] += amount;
            chartData.counts["Активные заявки"] += 1;
        }
    });

    // Отладочный вывод
    console.log('Данные для диаграммы:', chartData);

    return chartData;
}

// Форматирование суммы в читаемый вид
function formatCurrency(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.', ',') + ' млн';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + ' тыс';
    }
    return amount.toString();
}

// Функция для рисования фона с тенью
function drawCanvasWithShadow(ctx, canvas, dpr) {
    // Сохраняем текущее состояние контекста
    ctx.save();

    // Применяем тень
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Рисуем фон
    ctx.fillStyle = '#E6F4FF'; // Голубой фон
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Восстанавливаем состояние контекста (автоматически сбрасывает тень)
    ctx.restore();
}

// Функция для рисования подписи сверху графика
function drawTotalApplicationsLabel(ctx, chartData, canvasWidth, dpr) {
    // Вычисляем общее количество заявок
    let totalApplications = 0;
    chartData.groups.forEach(group => {
        totalApplications += chartData.counts[group];
    });

    // Рисуем подпись сверху
    ctx.save();
    ctx.font = '14px TT Fors, Inter, Arial, sans-serif'; // Немного больше шрифт
    ctx.textAlign = 'center';
    ctx.fillStyle = '#374151'; // Темно-серый цвет

    // Подпись по центру сверху
    const labelText = `Общее количество заявок: ${totalApplications}`;
    ctx.fillText(labelText, canvasWidth / 2, 25);

    ctx.restore();
}

// Функция для рисования вертикальной легенды с количеством записей (для экранов > 1480px)
function drawVerticalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY) {
    const legendHeight = 90;
    const startY = columnBaseY + 30;

    // Использую всю ширину для лучшего распределения
    const startX = 20;
    const legendWidth = canvasWidth - 40;

    // Рисуем фон для легенды
    ctx.save();
    ctx.fillStyle = '#E6F4FF';
    ctx.fillRect(startX, startY - 8, legendWidth, legendHeight - 12);

    // Рисуем границу легенды
    ctx.strokeStyle = '#E6F4FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY - 8, legendWidth, legendHeight - 12);
    ctx.restore();

    // Настройки для вертикального списка (одна колонка)
    const itemHeight = 25;
    const colorBoxSize = 12;
    const textOffset = colorBoxSize + 8;

    let currentY = startY + 5;

    ctx.save();
    ctx.font = '12px TT Fors, Inter, Arial, sans-serif';
    ctx.textAlign = 'left';

    // Распределяем группы в одну колонку по центру
    const itemsStartX = startX + (legendWidth - 220) / 2;

    chartData.groups.forEach((group) => {
        // Рисуем цветной квадратик
        ctx.fillStyle = GROUP_COLORS[group];
        ctx.fillRect(itemsStartX, currentY, colorBoxSize, colorBoxSize);

        // Рисуем обводку квадратика
        ctx.strokeStyle = GROUP_COLORS[group];
        ctx.lineWidth = 1;
        ctx.strokeRect(itemsStartX, currentY, colorBoxSize, colorBoxSize);

        // Рисуем название группы
        ctx.fillStyle = '#374151';
        const groupText = group;
        ctx.fillText(groupText, itemsStartX + textOffset, currentY + 10);

        // Рисуем количество записей справа
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6B7280';
        const countText = `${chartData.counts[group]} шт`;
        ctx.fillText(countText, itemsStartX + legendWidth - 50, currentY + 10);

        // Возвращаем выравнивание
        ctx.textAlign = 'left';

        currentY += itemHeight;
    });

    ctx.restore();
}

// Функция для рисования горизонтальной легенды (для экранов от 769px до 1480px)
function drawHorizontalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY) {
    const legendHeight = 70; // Уменьшаем высоту для горизонтального расположения
    const startY = columnBaseY + 30;

    // Использую всю ширину
    const startX = 10;
    const legendWidth = canvasWidth - 20;

    // Рисуем фон для легенды
    ctx.save();
    ctx.fillStyle = '#E6F4FF';
    ctx.fillRect(startX, startY - 8, legendWidth, legendHeight - 12);

    // Рисуем границу легенды
    ctx.strokeStyle = '#E6F4FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY - 8, legendWidth, legendHeight - 12);
    ctx.restore();

    // Настройки для горизонтального расположения
    const itemsCount = chartData.groups.length;
    const itemWidth = Math.min(180, (legendWidth - 40) / itemsCount); // Максимальная ширина элемента
    const colorBoxSize = 12;
    const itemSpacing = 10;

    let currentX = startX + 20;

    ctx.save();
    ctx.font = '12px TT Fors, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';

    chartData.groups.forEach((group) => {
        const itemCenterX = currentX + itemWidth / 2;

        // Рисуем цветной квадратик
        ctx.fillStyle = GROUP_COLORS[group];
        ctx.fillRect(itemCenterX - colorBoxSize / 2, startY + 5, colorBoxSize, colorBoxSize);

        // Рисуем название группы (центрируем под квадратиком)
        ctx.fillStyle = '#374151';
        const groupText = group;
        ctx.fillText(groupText, itemCenterX, startY + 30);

        // Рисуем количество записей под названием
        ctx.fillStyle = '#6B7280';
        const countText = `${chartData.counts[group]} шт`;
        ctx.fillText(countText, itemCenterX, startY + 45);

        currentX += itemWidth + itemSpacing;
    });

    ctx.restore();
}

// Функция для рисования вертикальной легенды для мобильных (≤ 768px)
function drawMobileVerticalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY) {
    const legendHeight = 90;
    const startY = columnBaseY + 30;

    // Использую всю ширину для лучшего распределения (с отступами)
    const startX = 15;
    const legendWidth = canvasWidth - 30;

    // Рисуем фон для легенды
    ctx.save();
    ctx.fillStyle = '#E6F4FF';
    ctx.fillRect(startX, startY - 8, legendWidth, legendHeight - 12);
    ctx.restore();

    // Настройки для вертикального списка (одна колонка) - адаптированы для мобильных
    const itemHeight = 25;
    const colorBoxSize = 10; // Уменьшаем для мобильных
    const textOffset = colorBoxSize + 6;

    let currentY = startY + 5;

    ctx.save();
    ctx.font = '11px TT Fors, Inter, Arial, sans-serif'; // Уменьшаем шрифт для мобильных
    ctx.textAlign = 'left';

    // Распределяем группы по центру с учетом мобильного экрана
    const itemsStartX = startX + 10;

    chartData.groups.forEach((group) => {
        // Рисуем цветной квадратик
        ctx.fillStyle = GROUP_COLORS[group];
        ctx.fillRect(itemsStartX, currentY, colorBoxSize, colorBoxSize);

        // Рисуем обводку квадратика
        ctx.strokeStyle = GROUP_COLORS[group];
        ctx.lineWidth = 1;
        ctx.strokeRect(itemsStartX, currentY, colorBoxSize, colorBoxSize);

        // Рисуем название группы
        ctx.fillStyle = '#374151';
        const groupText = group;
        ctx.fillText(groupText, itemsStartX + textOffset, currentY + 8);

        // Рисуем количество записей справа
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6B7280';
        const countText = `${chartData.counts[group]} шт`;
        ctx.fillText(countText, startX + legendWidth - 10, currentY + 8);

        // Возвращаем выравнивание
        ctx.textAlign = 'left';

        currentY += itemHeight;
    });

    ctx.restore();
}

// Функция для рисования легенды в зависимости от ширины экрана
function drawLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY) {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 768) {
        // Вертикальная легенда для экранов ≤ 768px (мобильные)
        drawMobileVerticalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY);
    } else if (screenWidth <= 1480) {
        // Горизонтальная легенда для экранов от 769px до 1480px
        drawHorizontalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY);
    } else {
        // Вертикальная легенда для экранов > 1480px (широкие экраны)
        drawVerticalLegend(ctx, chartData, canvasWidth, canvasHeight, dpr, columnBaseY);
    }
}

// Функция для рисования одной надписи "Сумма" по центру выше легенды
function drawSingleSumLabel(ctx, canvasWidth, columnBaseY) {
    // Рисуем надпись "Сумма" один раз по центру, между графиком и легендой
    const labelY = columnBaseY + 15;

    ctx.save();
    ctx.font = '12px TT Fors, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';

    // Надпись "Сумма" по центру диаграммы
    ctx.fillText('Сумма', canvasWidth / 2, labelY);

    ctx.restore();
}

// Функция для расчета значений оси Y (4 отрезка) - синхронизировано с высотой столбцов
function calculateYValues(maxValue) {
    // 0, средняя сумма1, средняя сумма2, итог
    return [
        0, // 0
        maxValue * 0.33, // средняя сумма1 (1/3 от максимума)
        maxValue * 0.66, // средняя сумма2 (2/3 от максимума)
        maxValue // итог (максимум)
    ];
}

// Функция для расчета отступов в зависимости от ширины экрана
function calculatePadding() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 768) {
        // Отступы для мобильных экранов - уменьшаем для лучшего размещения
        return {
            top: 40,
            right: 20,
            bottom: 140, // Увеличиваем отступ снизу для вертикальной легенды
            left: 40
        };
    } else if (screenWidth <= 1480) {
        // Отступы для экранов от 769px до 1480px
        return {
            top: 45,
            right: 20,
            bottom: 100, // Отступ для горизонтальной легенды
            left: 50
        };
    } else {
        // Отступы для широких экранов (> 1480px)
        return {
            top: 50,
            right: 20,
            bottom: 130,
            left: 60
        };
    }
}

// Отрисовка столбчатой диаграммы
function renderTreeChart() {
    const chartContainer = document.querySelector('.chart-info');
    if (!chartContainer) return;

    const chartData = getTreeChartData();

    // Очищаем контейнер
    chartContainer.innerHTML = '';

    if (!chartData) {
        chartContainer.innerHTML = '<div class="no-data">Нет данных для отображения</div>';
        return;
    }

    // Создаем canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'treeChart';

    // Устанавливаем размеры canvas
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = chartContainer.clientWidth;
    const canvasHeight = 350;

    canvas.width = containerWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Масштабируем для Retina дисплеев
    canvas.style.width = '100%';
    canvas.style.height = `${canvasHeight}px`;

    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Масштабируем контекст для Retina дисплеев
    ctx.scale(dpr, dpr);

    // Сначала рисуем фон с тенью
    drawCanvasWithShadow(ctx, canvas, dpr);

    // Рисуем подпись сверху графика
    drawTotalApplicationsLabel(ctx, chartData, canvas.width / dpr, dpr);

    // Определяем адаптивные отступы
    const screenWidth = window.innerWidth;
    const padding = calculatePadding();

    const graphWidth = (canvas.width / dpr) - padding.left - padding.right;
    const graphHeight = (canvas.height / dpr) - padding.top - padding.bottom;

    // Находим максимальное значение суммы для масштабирования
    const sumValues = Object.values(chartData.sums);
    let maxValue = Math.max(...sumValues);

    // Если все значения 0, устанавливаем максимальное значение для отображения
    if (maxValue === 0) maxValue = 100;

    // Количество групп и столбцов
    const groupCount = chartData.groups.length;
    
    // Определяем ширину столбцов в зависимости от размера экрана
    let columnWidth;
    if (screenWidth <= 768) {
        columnWidth = Math.min((graphWidth * 0.6) / groupCount, 35); // Уменьшаем ширину для мобильных
    } else if (screenWidth <= 1480) {
        columnWidth = Math.min((graphWidth * 0.7) / groupCount, 50);
    } else {
        columnWidth = Math.min((graphWidth * 0.7) / groupCount, 60);
    }
    
    const groupSpacing = (graphWidth - (columnWidth * groupCount)) / (groupCount + 1);

    // Высота области для столбцов (70% от общей высоты графика)
    const columnHeight = graphHeight * 0.7;

    // Позиция начала области столбцов
    const columnBaseY = padding.top + graphHeight - columnHeight;

    // Функция для преобразования значения в координату Y для сетки (синхронизировано с высотой столбцов)
    const scaleY = value => columnBaseY + columnHeight - (value / maxValue) * columnHeight;

    // Рисуем оси (без верхней границы)
    ctx.beginPath();
    ctx.moveTo(padding.left, columnBaseY);
    ctx.lineTo(padding.left, columnBaseY + columnHeight);
    ctx.lineTo(padding.left + graphWidth, columnBaseY + columnHeight);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Сетка и подписи на оси Y (4 отрезка) - синхронизировано с высотой столбцов
    const fontSize = screenWidth <= 768 ? '11px' : '12px';
    ctx.font = `${fontSize} TT Fors, Inter, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6B7280';

    // Рассчитываем значения для 4 отрезков
    const yValues = calculateYValues(maxValue);

    // Рисуем 4 горизонтальные линии и подписи (синхронизировано с высотой столбцов)
    yValues.forEach((value, index) => {
        const y = scaleY(value);

        // Горизонтальные линии сетки
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + graphWidth, y);
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Подписи на оси Y
        let labelText;
        switch (index) {
            case 0:
                labelText = '0';
                break;
            case 1:
                labelText = formatCurrency(value);
                break;
            case 2:
                labelText = formatCurrency(value);
                break;
            case 3:
                labelText = formatCurrency(value);
                break;
        }
        ctx.fillText(labelText, padding.left - 8, y + 4);
    });

    // Рисуем столбцы
    let currentX = padding.left + groupSpacing;

    chartData.groups.forEach((group, groupIndex) => {
        const sumValue = chartData.sums[group];

        // Реальная высота столбца (пропорционально значению)
        const sumHeight = (sumValue / maxValue) * columnHeight;

        // Позиция для столбца по X
        const sumX = currentX;

        // Позиция для столбца по Y (снизу вверх)
        const rectY = columnBaseY + columnHeight - sumHeight;

        // Столбец суммы (заполненный)
        ctx.fillStyle = GROUP_COLORS[group];
        ctx.fillRect(sumX, rectY, columnWidth, sumHeight);

        // Обводка столбца суммы
        ctx.strokeStyle = GROUP_COLORS[group];
        ctx.lineWidth = 1;
        ctx.strokeRect(sumX, rectY, columnWidth, sumHeight);

        // Текст суммы над столбцом
        ctx.fillStyle = GROUP_COLORS[group];
        ctx.font = `${fontSize} TT Fors, Inter, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(formatCurrency(sumValue), sumX + columnWidth / 2, rectY - 6);

        // Сдвигаем позицию для следующей группы
        currentX += columnWidth + groupSpacing;
    });

    // Рисуем одну надпись "Сумма" по центру между графиком и легендой
    drawSingleSumLabel(ctx, canvas.width / dpr, columnBaseY + columnHeight);

    // Рисуем легенду с учетом текущего размера экрана
    drawLegend(ctx, chartData, canvas.width / dpr, canvas.height / dpr, dpr, columnBaseY + columnHeight);
}

// Добавляем кастомные стили для диаграммы
function addTreeChartStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* Стили для столбчатой диаграммы */
    .chart-info {
      background: transparent;
      border-radius: 8px;
      min-height: 350px;
      position: relative;
      overflow: hidden;
    }
    
    #treeChart {
      display: block;
      width: 100%;
      height: 350px;
      border-radius: 8px;
    }
    
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--grey);
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
    
    /* Адаптивность для горизонтальной легенды (от 769px до 1480px) */
    @media (max-width: 1480px) and (min-width: 769px) {
      .chart-info {
        min-height: 340px;
      }
      
      #treeChart {
        height: 340px;
      }
    }
    
    /* Адаптивность для вертикальной легенды (≤ 768px) */
    @media (max-width: 768px) {
      .chart-info {
        min-height: 380px;
      }
      
      #treeChart {
        height: 380px;
      }
    }
    
    @media (max-width: 480px) {
      .chart-info {
        min-height: 400px;
      }
      
      #treeChart {
        height: 400px;
      }
    }
  `;
    document.head.appendChild(style);
}

// Инициализация стилей
addTreeChartStyles();

// Инициализация при изменении размера окна
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        if (document.querySelector('.chart-info')) {
            renderTreeChart();
        }
    }, 100);
});

// Экспортируем функции для обновления при изменении фильтров
export function updateTreeChart() {
    if (document.querySelector('.chart-info')) {
        renderTreeChart();
    }
}

// Для обновления диаграммы из других скриптов
window.updateTreeChart = updateTreeChart;

// Инициализируем при загрузке
initTreeChart();