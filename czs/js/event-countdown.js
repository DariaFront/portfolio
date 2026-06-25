/**
 * event-countdown.js — Автоматический подсчет дней до события + обновление даты в примечании
 * Работает с форматом: "ДД—ДД месяц ГГГГ" или "ДД месяц ГГГГ"
 * Также обновляет дату в .big-number-note на текущую
 */
(function() {
    'use strict';

    // ==================== КОНФИГУРАЦИЯ ====================
    const CONFIG = {
        // Селектор для блока с примечанием о дате
        noteSelector: '.big-number-note',
        // Формат даты для подстановки: 'DD.MM.YYYY' или 'Д Д месяц ГГГГ'
        dateFormat: 'DD.MM.YYYY',
        // Как часто обновлять таймеры (в миллисекундах)
        updateInterval: 6 * 3600 * 1000, // 6 часов
        // Время обновления для "сегодня" (в часах, по местному времени)
        refreshHour: 4 // в 04:00 сбрасывать кеш "сегодня"
    };

    // ==================== УТИЛИТЫ ====================
    
    // Маппинг русских месяцев
    const MONTHS = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
        'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };

    const MONTHS_REVERSE = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    /**
     * Форматирует дату в нужный формат
     * @param {Date} date 
     * @param {string} format - 'DD.MM.YYYY' | 'D month YYYY'
     */
    function formatDate(date, format) {
        const day = date.getDate();
        const month = MONTHS_REVERSE[date.getMonth()];
        const year = date.getFullYear();

        if (format === 'DD.MM.YYYY') {
            const dd = String(day).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            return `${dd}.${mm}.${year}`;
        }
        
        if (format === 'D month YYYY') {
            return `${day} ${month} ${year}`;
        }

        // Default fallback
        return `${day}.${month}.${year}`;
    }

    /**
     * Парсит дату из текста вида "15—18 сентября 2026"
     * Берет ПЕРВУЮ дату в диапазоне как дату старта
     */
    function parseRussianDate(text) {
        const regex = /(\d{1,2})\s*[—–-]?\s*(?:\d{1,2}\s+)?([а-яёА-ЯЁ]+)\s+(\d{4})/;
        const match = text.match(regex);
        if (!match) return null;

        const day = parseInt(match[1], 10);
        const month = MONTHS[match[2].toLowerCase()];
        const year = parseInt(match[3], 10);

        if (month === undefined) return null;
        
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Склонение слова "день"
     */
    function getDaysWord(days) {
        const abs = Math.abs(days);
        const last2 = abs % 100;
        const last1 = abs % 10;

        if (last2 >= 11 && last2 <= 19) return 'дней';
        if (last1 === 1) return 'день';
        if (last1 >= 2 && last1 <= 4) return 'дня';
        return 'дней';
    }

    // ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

    /**
     * Обновляет дату в примечании .big-number-note
     * Ищет паттерн "по ДД.ММ.ГГГГ" или "по Д месяц ГГГГ" и заменяет на сегодня
     */
    function updateNoteDate() {
        const noteEl = document.querySelector(CONFIG.noteSelector);
        if (!noteEl) return;

        const originalText = noteEl.textContent.trim();
        
        // Паттерн для поиска даты в конце: "по 27.05.2026" или "по 27 мая 2026"
        const datePattern = /по\s+(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{1,2}\s+[а-яё]+)\s*\d{4}?/i;
        
        if (!datePattern.test(originalText)) {
            // Если паттерн не найден — пробуем более мягкий поиск
            const fallbackPattern = /\d{1,2}[./]\d{1,2}[./]\d{4}/;
            if (fallbackPattern.test(originalText)) {
                const todayStr = formatDate(new Date(), CONFIG.dateFormat);
                noteEl.textContent = originalText.replace(fallbackPattern, todayStr);
            }
            return;
        }

        // Формируем строку замены в том же формате, что и в конфиге
        const todayFormatted = formatDate(new Date(), CONFIG.dateFormat);
        const replacement = `по ${todayFormatted}`;
        
        // Заменяем только дату, сохраняя остальной текст
        const newText = originalText.replace(datePattern, replacement);
        noteEl.textContent = newText;
        
        // Добавляем атрибут для отладки / CSS-стилей
        noteEl.dataset.dateUpdated = new Date().toISOString();
    }

    /**
     * Обновляет таймеры обратного отсчёта в карточках событий
     */
    function updateCountdowns() {
        const cards = document.querySelectorAll('.event-card');
        
        cards.forEach(card => {
            // Ищем блок с датой (по наличию иконки календаря с alt="data")
            const dateEl = card.querySelector('.event-info img[alt="data"]')?.closest('.event-info');
            if (!dateEl) return;

            const dateText = dateEl.textContent.trim();
            const eventDate = parseRussianDate(dateText);
            if (!eventDate) return;

            // Считаем разницу в днях (нормализуем оба значения до начала суток)
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const diffMs = eventDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            // Обновляем DOM
            const targetEl = card.querySelector('.days-left strong');
            if (targetEl) {
                if (daysLeft < 0) {
                    targetEl.textContent = 'Событие прошло';
                    card.dataset.status = 'passed';
                } else if (daysLeft === 0) {
                    targetEl.textContent = 'Сегодня';
                    card.dataset.status = 'today';
                } else {
                    targetEl.textContent = `${daysLeft} ${getDaysWord(daysLeft)}`;
                    card.dataset.status = 'future';
                }
            }
        });
    }

    /**
     * Главная функция обновления всего
     */
    function updateAll() {
        updateNoteDate();
        updateCountdowns();
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================

    function init() {
        // Первичный запуск
        updateAll();

        // Авто-обновление по интервалу
        setInterval(updateAll, CONFIG.updateInterval);

        // 🔔 Опционально: обновление при возврате вкладки в фокус (экономия ресурсов)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateAll();
            }
        });

        // 🔔 Опционально: обновление при изменении системного времени (редко, но бывает)
        window.addEventListener('storage', (e) => {
            if (e.key === 'czs:date-check') {
                updateAll();
            }
        });
    }

    // Запуск при готовности DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==================== ПУБЛИЧНЫЙ API ====================
    window.CZSEvents = {
        updateCountdowns,
        updateNoteDate,
        updateAll,
        formatDate,
        parseRussianDate
    };

})();