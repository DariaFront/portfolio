/**
 * chart-builder.js — Построение линейных диаграмм для CZS Stats
 * Размещается ПОСЛЕ блока .stats-section
 */

const CZSChartBuilder = (function() {
    'use strict';

    const CONFIG = {
        ANIMATION_DURATION: 600,
        MAX_ITEMS: 5,
        CONTAINER_ID: 'czs-charts-container',
        SELECTORS: {
            STATS_SECTION: '.stats-section',
            STAT_ROW: '.stat-row',
            STAT_FILL: '.stat-fill',
            STAT_VALUE: '.stat-value-right'
        }
    };

    let currentData = null;
    let container = null;

    /**
     * Создаёт или получает контейнер для диаграмм ПОСЛЕ .stats-section
     */
    function ensureContainer() {
        // Если уже создан — возвращаем
        if (container && document.getElementById(CONFIG.CONTAINER_ID)) {
            return container;
        }

        // Ищем секцию со статистикой
        const statsSection = document.querySelector(CONFIG.SELECTORS.STATS_SECTION);
        if (!statsSection) {
            console.warn('📊 ChartBuilder: .stats-section not found');
            return null;
        }

        // Создаём контейнер
        container = document.createElement('div');
        container.id = CONFIG.CONTAINER_ID;
        container.className = 'czs-charts-wrapper';
        container.innerHTML = `
            <div class="stats-grid-2">
                <div class="stats-block1 stats-block">
                    <h3>Топ 5 категорий в закупке</h3>
                    <div class="chart-rows categories-rows"></div>
                </div>
                <div class="stats-block">
                    <h3>Топ 5 покупателей</h3>
                    <div class="chart-rows buyers-rows"></div>
                </div>
            </div>
        `;

        // Вставляем ПОСЛЕ .stats-section
        statsSection.insertAdjacentElement('afterend', container);
        
        console.log('📊 Charts container inserted after .stats-section');
        return container;
    }

    /**
     * Создаёт строку диаграммы
     */
    function createStatRow(item, index, maxValue) {
        const percent = maxValue > 0 ? Math.round((item.sum / maxValue) * 100) : 0;
        const safePercent = Math.min(100, Math.max(5, percent));

        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <span class="stat-label">${index + 1}. ${escapeHtml(item.name)}</span>
            <div class="stat-bar" title="${item.sumFormatted}">
                <div class="stat-fill" style="width: 0%" data-value="${item.sum}"></div>
            </div>
            <span class="stat-value-right">${item.sumFormatted}</span>
        `;
        return { row, percent: safePercent };
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Анимация заполнения полоски
     */
    function animateFill(element, targetPercent, delay = 0) {
        setTimeout(() => {
            element.style.transition = `width ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.width = targetPercent + '%';
        }, delay);
    }

    /**
     * Обновляет блок с категориями
     */
    function updateCategoriesBlock(categories, maxValue) {
        const rowsContainer = container?.querySelector('.categories-rows');
        if (!rowsContainer) return;

        rowsContainer.innerHTML = '';
        
        categories.slice(0, CONFIG.MAX_ITEMS).forEach((item, idx) => {
            const { row, percent } = createStatRow(item, idx, maxValue);
            rowsContainer.appendChild(row);
            const fill = row.querySelector(CONFIG.SELECTORS.STAT_FILL);
            if (fill) animateFill(fill, percent, idx * 80);
        });
    }

    /**
     * Обновляет блок с покупателями
     */
    function updateBuyersBlock(buyers, maxValue) {
        const rowsContainer = container?.querySelector('.buyers-rows');
        if (!rowsContainer) return;

        rowsContainer.innerHTML = '';
        
        buyers.slice(0, CONFIG.MAX_ITEMS).forEach((item, idx) => {
            const { row, percent } = createStatRow(item, idx, maxValue);
            rowsContainer.appendChild(row);
            const fill = row.querySelector(CONFIG.SELECTORS.STAT_FILL);
            if (fill) animateFill(fill, percent, idx * 80);
        });
    }

    /**
     * Публичный метод рендеринга
     */
    function render(data) {
        if (!data || (!data.categories?.length && !data.buyers?.length)) {
            console.warn('📊 ChartBuilder: no data to render');
            return false;
        }

        currentData = data;
        
        if (!ensureContainer()) {
            console.warn('📊 ChartBuilder: container not created');
            return false;
        }

        // Вычисляем максимум для масштабирования
        const allSums = [
            ...(data.categories || []).map(c => c.sum || 0),
            ...(data.buyers || []).map(b => b.sum || 0)
        ];
        const maxValue = data.maxValue || Math.max(...allSums, 1);

        updateCategoriesBlock(data.categories || [], maxValue);
        updateBuyersBlock(data.buyers || [], maxValue);

        console.log('📈 Charts rendered:', {
            categories: data.categories?.length || 0,
            buyers: data.buyers?.length || 0
        });
        
        return true;
    }

    /**
     * Перерисовка с новыми данными
     */
    function refresh(newData) {
        if (newData) currentData = { ...currentData, ...newData };
        if (currentData) render(currentData);
    }

    /**
     * Очистка диаграмм
     */
    function clear() {
        if (container) {
            const fills = container.querySelectorAll(CONFIG.SELECTORS.STAT_FILL);
            fills.forEach(f => f.style.width = '0%');
        }
        currentData = null;
    }

    /**
     * Показать/скрыть блок
     */
    function setVisible(visible) {
        if (container) {
            container.style.display = visible ? '' : 'none';
        }
    }

    // Публичный API
    return {
        render,
        refresh,
        clear,
        setVisible,
        getConfig: () => ({ ...CONFIG }),
        getData: () => currentData,
        isReady: () => !!container
    };

})();

// Экспортируем в глобальную область
if (typeof window !== 'undefined') {
    window.CZSChartBuilder = CZSChartBuilder;
}

// Авто-инициализация при наличии данных в CZSStats
if (typeof window.CZSStats !== 'undefined' && typeof CZSChartBuilder !== 'undefined') {
    // Ждём, когда DOM будет готов и статистика загрузится
    function tryInit() {
        const cached = window.CZSStats.getData?.();
        if (cached && (cached.categories?.length || cached.buyers?.length)) {
            const maxValue = Math.max(
                ...(cached.categories || []).map(c => c.sum || 0),
                ...(cached.buyers || []).map(b => b.sum || 0),
                1
            );
            CZSChartBuilder.render({
                categories: cached.categories,
                buyers: cached.buyers,
                maxValue
            });
        }
    }
    
    // Пробуем сразу и с задержкой (на случай асинхронной загрузки)
    if (document.readyState === 'complete') {
        setTimeout(tryInit, 200);
    } else {
        window.addEventListener('load', () => setTimeout(tryInit, 300));
    }
}