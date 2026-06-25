// scriptDownChart.js
import { chartDataFromTestObject } from './data.js';

// Константы для графиков
const STATUS_COLORS_DOWN = {
    "В процессе": "#4A6FFF",
    "На согласовании": "#00a0c8",
    "Завершено": "#0a857e",
    "Ожидается": "#FFA726",
    "Просрочено": "#EF5350"
};

// Главная функция инициализации графиков
function initDownChart() {
    console.log('Инициализация графиков для нижнего блока...');

    // Проверяем существование контейнеров
    const lineChartContainer = document.getElementById('down');
    const allChartsContainer = document.getElementById('all');

    if (!lineChartContainer || !allChartsContainer) {
        console.error('Контейнеры для графиков не найдены');
        return;
    }

    renderLineChart(lineChartContainer);
    renderAllCharts(allChartsContainer);
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDownChart);
} else {
    setTimeout(initDownChart, 100);
}

// Форматирование суммы
function formatCurrency(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.', ',') + ' млн';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + ' тыс';
    }
    return amount.toString();
}

// Форматирование процентов
function formatPercent(value, total) {
    return ((value / total) * 100).toFixed(1) + '%';
}

// Отрисовка линейного графика
function renderLineChart(container) {
    const data = chartDataFromTestObject.timeSeriesData;

    // Очищаем контейнер
    container.innerHTML = '';

    // Создаем canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'downLineChart';
    canvas.style.width = '100%';
    canvas.style.height = '240px';
    canvas.width = container.clientWidth;
    canvas.height = 240;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Настройки графика
    const padding = { top: 40, right: 30, bottom: 40, left: 90 };
    const graphWidth = canvas.width - padding.left - padding.right;
    const graphHeight = canvas.height - padding.top - padding.bottom;

    // Находим максимальное значение
    const maxValue = Math.max(...data.values);

    // Функции для масштабирования
    const scaleY = value => padding.top + graphHeight - (value / maxValue) * graphHeight;
    const scaleX = index => padding.left + (index / (data.labels.length - 1 || 1)) * graphWidth;

    // Рисуем фон
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем оси
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Подписи осей
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Дата', (canvas.width - padding.right + padding.left) / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Объем закупок, ₽', 0, 0);
    ctx.restore();

    // Сетка и подписи на оси Y
    ctx.font = '11px TT Fors, Inter, Arial, sans-serif';
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
        ctx.fillText(formatCurrency(value), padding.left - 10, y + 4);
    }

    // Подписи на оси X
    ctx.textAlign = 'center';
    data.labels.forEach((label, index) => {
        const x = scaleX(index);
        ctx.fillText(label, x, canvas.height - padding.bottom + 15);
    });

    // Рисуем основную линию графика
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0B63A8';

    data.values.forEach((value, index) => {
        const x = scaleX(index);
        const y = scaleY(value);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Рисуем точки
    data.values.forEach((value, index) => {
        const x = scaleX(index);
        const y = scaleY(value);

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#0B63A8';
        ctx.fill();

        // Белая обводка точек
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Легенда под графиком
    createLineChartLegend(container, data);
    
    // Добавляем компактный summary под легендой
    createCompactChartSummary(container, chartDataFromTestObject.categoryData);
}

// Создание легенды для линейного графика
function createLineChartLegend(container, data) {
    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-down';

    // Рассчитываем статистику
    const lastValue = data.values[data.values.length - 1];
    const firstValue = data.values[0];
    const growth = ((lastValue - firstValue) / firstValue * 100).toFixed(1);

    // Создаем элементы легенды
    const legendItem = document.createElement('div');
    legendItem.className = 'chart-legend-down-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'chart-legend-color';
    colorBox.style.backgroundColor = '#0B63A8';

    const textContainer = document.createElement('div');
    textContainer.className = 'chart-legend-content';

    const title = document.createElement('span');
    title.className = 'chart-legend-title';
    title.textContent = 'Общий объем закупок';

    const value = document.createElement('span');
    value.className = 'chart-legend-value';
    value.textContent = formatCurrency(lastValue);

    const growthBadge = document.createElement('span');
    growthBadge.className = 'chart-legend-badge ' + (growth >= 0 ? 'positive' : 'negative');
    growthBadge.textContent = growth >= 0 ? `+${growth}%` : `${growth}%`;

    textContainer.appendChild(title);
    textContainer.appendChild(value);
    textContainer.appendChild(growthBadge);

    legendItem.appendChild(colorBox);
    legendItem.appendChild(textContainer);
    legendContainer.appendChild(legendItem);

    container.appendChild(legendContainer);
}

// Создание компактного summary
function createCompactChartSummary(container, categoryData) {
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'compact-chart-summary';

    const total = categoryData.values.reduce((sum, val) => sum + val, 0);
    const maxValue = Math.max(...categoryData.values);
    const maxIndex = categoryData.values.indexOf(maxValue);
    const avgValue = total / categoryData.values.length;
    const minValue = Math.min(...categoryData.values);

    // Создаем таблицу с ключевыми показателями
    const statsTable = document.createElement('table');

    const stats = [
        { label: 'Общий объем', value: formatCurrency(total), color: '#0B63A8' },
        { label: 'Категорий', value: categoryData.labels.length, color: '#0a857e' },
        { label: 'Средняя сумма', value: formatCurrency(avgValue), color: '#00a0c8' },
        { label: 'Максимум', value: formatCurrency(maxValue), color: '#4A6FFF' },
        { label: 'Минимум', value: formatCurrency(minValue), color: '#EF5350' },
        { label: 'Топ категория', value: categoryData.labels[maxIndex].replace('\n', ' '), color: '#FFA726' }
    ];

    // Создаем 2 строки по 3 столбца
    for (let i = 0; i < 2; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            if (index >= stats.length) break;
            
            const stat = stats[index];
            const cell = document.createElement('td');
            
            if (i === 1) {
                cell.style.borderBottom = 'none';
            }
            
            const labelSpan = document.createElement('div');
            labelSpan.className = 'compact-summary-label';
            labelSpan.textContent = stat.label;
            
            const valueSpan = document.createElement('div');
            valueSpan.className = 'compact-summary-value';
            valueSpan.style.color = stat.color;
            valueSpan.textContent = stat.value;
            
            cell.appendChild(labelSpan);
            cell.appendChild(valueSpan);
            row.appendChild(cell);
        }
        
        statsTable.appendChild(row);
    }

    summaryContainer.appendChild(statsTable);
    container.appendChild(summaryContainer);
}

// Отрисовка только круговой диаграммы в контейнере #all
function renderAllCharts(container) {
    const data = chartDataFromTestObject;

    // Очищаем контейнер
    container.innerHTML = '';

    // Создаем круговую диаграмму
    const pieChartSection = createPieChartSection(data.categoryData);
    container.appendChild(pieChartSection);
}

// Создание круговой диаграммы
function createPieChartSection(categoryData) {
    const section = document.createElement('div');
    section.className = 'pie-chart-container';

    // Заголовок
    const title = document.createElement('h3');
    title.className = 'pie-chart-title';
    title.textContent = 'Распределение закупок по категориям';

    section.appendChild(title);

    // Основной контент - диаграмма и легенда
    const content = document.createElement('div');
    content.className = 'pie-chart-content';

    // Canvas для круговой диаграммы
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'pie-canvas-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'allPieChart';
    canvas.className = 'pie-canvas';
    canvas.width = 200;
    canvas.height = 200;

    canvasContainer.appendChild(canvas);
    content.appendChild(canvasContainer);

    // Рисуем круговую диаграмму
    setTimeout(() => {
        drawPieChart(canvas, categoryData);
    }, 50);

    // Легенда под диаграммой
    const legendContainer = createCompactLegend(categoryData);
    content.appendChild(legendContainer);
    section.appendChild(content);

    return section;
}

// Рисование круговой диаграммы
function drawPieChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    // Вычисляем общую сумму
    const total = data.values.reduce((sum, value) => sum + value, 0);

    // Рисуем сектора диаграммы
    let startAngle = 0;

    data.values.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;

        // Рисуем сектор
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        ctx.fillStyle = data.colors[index];
        ctx.fill();

        // Обводка сектора
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Добавляем выносные линии для крупных сегментов (> 5%)
        if (value / total > 0.05) {
            drawSegmentLabel(ctx, startAngle + sliceAngle / 2, value, index,
                centerX, centerY, radius, data);
        }

        startAngle += sliceAngle;
    });

    // Центр диаграммы (для donut chart)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Текст в центре
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px TT Fors, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Всего', centerX, centerY - 10);

    ctx.fillStyle = '#0B63A8';
    ctx.font = 'bold 16px TT Fors, Inter, Arial, sans-serif';
    ctx.fillText(formatCurrency(total), centerX, centerY + 15);
}

// Рисование подписей сегментов
function drawSegmentLabel(ctx, angle, value, index, centerX, centerY, radius, data) {
    const total = data.values.reduce((sum, val) => sum + val, 0);
    const percentage = ((value / total) * 100).toFixed(1);

    // Позиция на краю сегмента
    const labelRadius = radius * 0.7;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 10px TT Fors, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percentage}%`, x, y);
}

// Создание компактной легенды
function createCompactLegend(data) {
    const legendContainer = document.createElement('div');
    legendContainer.className = 'compact-legend';

    const total = data.values.reduce((sum, val) => sum + val, 0);

    data.labels.forEach((label, index) => {
        const percentage = ((data.values[index] / total) * 100).toFixed(1);

        if (percentage > 0) {
            const legendItem = document.createElement('div');
            legendItem.className = 'compact-legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'compact-legend-color';
            colorBox.style.backgroundColor = data.colors[index];

            const legendContent = document.createElement('div');
            legendContent.className = 'compact-legend-content';

            const labelText = document.createElement('span');
            labelText.className = 'compact-legend-label';
            labelText.textContent = label.replace('\n', ' ');

            const stats = document.createElement('div');
            stats.className = 'compact-legend-stats';

            const valueText = document.createElement('span');
            valueText.className = 'compact-legend-value';
            valueText.textContent = formatCurrency(data.values[index]);

            const percentageText = document.createElement('span');
            percentageText.className = 'compact-legend-percent';
            percentageText.textContent = `${percentage}%`;

            stats.appendChild(valueText);
            stats.appendChild(percentageText);

            legendContent.appendChild(labelText);
            legendContent.appendChild(stats);

            legendItem.appendChild(colorBox);
            legendItem.appendChild(legendContent);
            legendContainer.appendChild(legendItem);
        }
    });

    return legendContainer;
}

// Инициализация при изменении размера окна
let resizeTimeoutAll;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeoutAll);
    resizeTimeoutAll = setTimeout(function () {
        const lineChartContainer = document.getElementById('down');
        const allChartsContainer = document.getElementById('all');

        if (lineChartContainer) {
            renderLineChart(lineChartContainer);
        }

        if (allChartsContainer) {
            const canvas = allChartsContainer.querySelector('#allPieChart');
            if (canvas) {
                drawPieChart(canvas, chartDataFromTestObject.categoryData);
            }
        }
    }, 100);
});

// Экспортируем функции для обновления
export function updateDownChart() {
    const lineChartContainer = document.getElementById('down');
    const allChartsContainer = document.getElementById('all');

    if (lineChartContainer) {
        renderLineChart(lineChartContainer);
    }

    if (allChartsContainer) {
        renderAllCharts(allChartsContainer);
    }
}

// Для обновления из других скриптов
window.updateDownChart = updateDownChart;

// Инициализируем при загрузке
initDownChart();