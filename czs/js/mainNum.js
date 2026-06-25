/**
 * stats-loader.js — ВЕРСИЯ 2.0
 * Парсинг по контексту + поддержка линейных диаграмм
 */

const STATS_CONFIG = {
    PROXY_URL: 'https://online-czs.ru/project/webroot/temp_files/proxy_stat.php',
    CACHE_KEY: 'czs_stats_data',
    LAST_CHECK_KEY: 'czs_stats_last_check',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 часа
    MAX_RETRIES: 2
};

// ==============================================
// ФОРМАТИРОВАНИЕ
// ==============================================
function formatNumber(num) {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatBillions(num) {
    if (!num && num !== 0) return "0.0 млрд ₽";
    const billions = num / 1000000000;
    return billions.toFixed(1).replace('.', ',') + ' млрд ₽';
}

function parseMoney(str) {
    if (!str) return 0;
    // Извлекаем число из строки типа "75.2 млрд ₽" или "75,2"
    const match = str.replace(/\s/g, '').match(/([\d,.]+)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.')) * 1000000000;
}

// ==============================================
// КЭШ
// ==============================================
function saveToCache(data) {
    try {
        localStorage.setItem(STATS_CONFIG.CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(STATS_CONFIG.LAST_CHECK_KEY, Date.now().toString());
    } catch (e) { console.warn('Cache save error:', e); }
}

function loadFromCache() {
    try {
        const cached = localStorage.getItem(STATS_CONFIG.CACHE_KEY);
        const lastCheck = localStorage.getItem(STATS_CONFIG.LAST_CHECK_KEY);
        if (cached && lastCheck && Date.now() - parseInt(lastCheck) < STATS_CONFIG.CACHE_DURATION) {
            return JSON.parse(cached);
        }
    } catch (e) { }
    return null;
}

// ==============================================
// ЗАГРУЗКА
// ==============================================
async function fetchWithRetry(retryCount = 0) {
    try {
        const response = await fetch(STATS_CONFIG.PROXY_URL, {
            method: 'GET', mode: 'cors',
            headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        if (!text || text.length < 100) throw new Error('Empty response');

        let html = text;
        try {
            const json = JSON.parse(text);
            if (json?.html) html = json.html;
        } catch (e) { }
        return html;
    } catch (error) {
        console.warn(`❌ Attempt ${retryCount + 1} failed:`, error.message);
        if (retryCount < STATS_CONFIG.MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, 1000));
            return fetchWithRetry(retryCount + 1);
        }
        throw error;
    }
}

// ==============================================
// УМНЫЙ ПАРСИНГ ПО КОНТЕКСТУ
// ==============================================
function parseStatsSmart(doc) {
    const result = {
        categories: [],
        buyers: [],
        summary: {}
    };

    // 1. Сумма контрактов (из .total_field .summ span)
    const sumElem = doc.querySelector('.total_field .summ span');
    const sumText = sumElem?.textContent?.replace(/\s/g, '') || '0';
    const sumInBillions = parseInt(sumText) || 0;
    result.totalSum = sumInBillions * 1000000000;

    // 2. Парсинг таблицы категорий
    const categoryTable = doc.querySelector('.vendor_field .toc-tableR.item');
    if (categoryTable) {
        const rows = categoryTable.querySelectorAll('tr.sname.toc-rowR');
        rows.forEach(row => {
            const nameEl = row.querySelector('.toc-leftR');
            const countEl = row.querySelector('.toc-times');
            const sumEl = row.querySelector('.toc-rightR.totall');
            
            if (nameEl && countEl && sumEl) {
                result.categories.push({
                    name: nameEl.textContent.trim(),
                    count: parseInt(countEl.textContent.replace(/\s/g, '')) || 0,
                    sum: parseMoney(sumEl.textContent),
                    sumFormatted: sumEl.textContent.trim()
                });
            }
        });
    }

    // 3. Парсинг таблицы покупателей
    const buyerTable = doc.querySelector('.buyer_field .toc-tableR.item');
    if (buyerTable) {
        const rows = buyerTable.querySelectorAll('tr.sname.toc-rowR');
        rows.forEach(row => {
            const nameEl = row.querySelector('.toc-leftR');
            const countEl = row.querySelector('.toc-times');
            const sumEl = row.querySelector('.toc-rightR.totall');
            
            if (nameEl && countEl && sumEl) {
                result.buyers.push({
                    name: nameEl.textContent.trim(),
                    count: parseInt(countEl.textContent.replace(/\s/g, '')) || 0,
                    sum: parseMoney(sumEl.textContent),
                    sumFormatted: sumEl.textContent.trim()
                });
            }
        });
    }

    // 4. Итоговые показатели из .result
    const resultBlock = doc.querySelector('.middle .result');
    if (resultBlock) {
        const totalViewed = resultBlock.querySelector('.res-1 .res-data span');
        const approved = resultBlock.querySelector('.res-2 .res-data span');
        const rate = resultBlock.querySelector('.res-3 .res-data span');
        
        result.summary = {
            totalNegotiations: parseInt(totalViewed?.textContent.replace(/\s/g, '')) || 0,
            prelimContracts: parseInt(approved?.textContent.replace(/\s/g, '')) || 0,
            successRate: parseInt(rate?.textContent) || 0
        };
    }

    // 5. Фоллбэк: если не нашли в таблице — ищем по контексту
    if (result.summary.totalNegotiations === 0) {
        const bodyText = doc.body.textContent || '';
        const totalMatch = bodyText.match(/Всего заявок рассмотрено[\s\S]*?(\d[\d\s]*)/i);
        if (totalMatch) {
            result.summary.totalNegotiations = parseInt(totalMatch[1].replace(/\s/g, ''));
        }
    }

    // 6. Фоллбэк значения (из логов)
    if (result.summary.totalNegotiations === 0) result.summary.totalNegotiations = 40820;
    if (result.summary.prelimContracts === 0) result.summary.prelimContracts = 33903;
    if (!result.summary.successRate) result.summary.successRate = 83;
    if (result.categories.length === 0) result.categories = getDefaultCategories();
    if (result.buyers.length === 0) result.buyers = getDefaultBuyers();

    result.lastUpdated = new Date().toISOString();
    console.log('✅ PARSED STATS:', { 
        totalSum: result.totalSum, 
        summary: result.summary,
        categories: result.categories.length,
        buyers: result.buyers.length
    });
    
    return result;
}

function getDefaultCategories() {
    return [
        { name: "Кондитерская, хлебопекарная продукция", count: 5191, sum: 75.2e9, sumFormatted: "75.2 млрд ₽" },
        { name: "Безалкогольные напитки, соки, воды", count: 4063, sum: 73.9e9, sumFormatted: "73.9 млрд ₽" },
        { name: "Снэки, орехи, сухофрукты", count: 3352, sum: 37.3e9, sumFormatted: "37.3 млрд ₽" },
        { name: "Бакалея. Зернопродукты", count: 3641, sum: 36.5e9, sumFormatted: "36.5 млрд ₽" },
        { name: "Здоровое питание. Спортивное питание. БАДы", count: 2024, sum: 27.4e9, sumFormatted: "27.4 млрд ₽" }
    ];
}

function getDefaultBuyers() {
    return [
        { name: "Ашан", count: 1143, sum: 33.9e9, sumFormatted: "33.9 млрд ₽" },
        { name: "Магнит", count: 730, sum: 25.9e9, sumFormatted: "25.9 млрд ₽" },
        { name: "Верный", count: 457, sum: 18.5e9, sumFormatted: "18.5 млрд ₽" },
        { name: "Командор", count: 560, sum: 16.6e9, sumFormatted: "16.6 млрд ₽" },
        { name: "METRO", count: 509, sum: 16.2e9, sumFormatted: "16.2 млрд ₽" }
    ];
}

// ==============================================
// ОБНОВЛЕНИЕ DOM — СТАТИСТИКА
// ==============================================
function updateStatsDOM(data) {
    if (!data) return;

    const updates = [
        { id: 'dogovor', value: formatNumber(data.summary?.prelimContracts), suffix: '' },
        { id: 'peregovor', value: formatNumber(data.summary?.totalNegotiations), suffix: '' },
        { id: 'sucsess', value: data.summary?.successRate, suffix: '%' },
        { id: 'allcount', value: formatBillions(data.totalSum), suffix: '' },
        { id: 'totalcount', value: formatBillions(data.totalSum), suffix: '' }
    ];

    updates.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            const current = el.textContent.trim();
            const newValue = item.value + item.suffix;
            if (current !== newValue) {
                animateValue(el, current, newValue, 800);
            }
        }
    });

    // Запускаем построение диаграмм, если модуль подключён
    if (typeof CZSChartBuilder !== 'undefined' && CZSChartBuilder.render) {
        CZSChartBuilder.render({
            categories: data.categories.slice(0, 5),
            buyers: data.buyers.slice(0, 5),
            maxValue: Math.max(
                ...data.categories.slice(0,5).map(c => c.sum),
                ...data.buyers.slice(0,5).map(b => b.sum)
            )
        });
    }
}

function animateValue(element, start, end, duration) {
    if (start === end) { element.textContent = end; return; }
    if (/[^\d\s.,]/.test(end)) { element.textContent = end; return; }

    const startNum = parseFloat(start.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const endNum = parseFloat(end.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const range = endNum - startNum;
    const startTime = performance.now();
    const isDecimal = end.includes(',');

    function step(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startNum + range * ease;
        let display = isDecimal ? current.toFixed(1).replace('.', ',') : Math.round(current).toLocaleString('ru-RU');
        const suffix = end.match(/[^\d\s.,]+$/)?.[0] || '';
        element.textContent = display + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ==============================================
// MAIN
// ==============================================
async function initStatsLoader() {
    console.log('📊 Stats loader v2.0 initialized');

    const cached = loadFromCache();
    if (cached) {
        console.log('📦 Using cached data');
        updateStatsDOM(cached);
    }

    try {
        const html = await fetchWithRetry();
        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const parsed = parseStatsSmart(doc);

            if (parsed.summary?.totalNegotiations > 0 || parsed.categories.length > 0) {
                console.log('✅ Fresh data loaded');
                saveToCache(parsed);
                updateStatsDOM(parsed);
                return;
            }
        }
        throw new Error('Parse failed');
    } catch (error) {
        console.warn('⚠️ Load error:', error.message);
        if (!cached) {
            updateStatsDOM({
                summary: { prelimContracts: 33903, totalNegotiations: 40820, successRate: 83 },
                totalSum: 747e9,
                categories: getDefaultCategories(),
                buyers: getDefaultBuyers(),
                lastUpdated: new Date().toISOString()
            });
        }
    }
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatsLoader);
} else {
    initStatsLoader();
}

// Публичный API
window.CZSStats = {
    reload: initStatsLoader,
    clearCache: () => {
        localStorage.removeItem(STATS_CONFIG.CACHE_KEY);
        localStorage.removeItem(STATS_CONFIG.LAST_CHECK_KEY);
        console.log('🗑️ Cache cleared');
        initStatsLoader();
    },
    debug: () => console.log('🔍 Cached data:', loadFromCache()),
    getData: () => loadFromCache()
};