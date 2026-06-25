// ==========================================================================
// ОСНОВНОЙ СКРИПТ САЙТА
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    console.log('Сайт загружен!');

    // ======================================================================
    // БУРГЕР-МЕНЮ
    // ======================================================================

    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    if (burgerBtn && mainNav) {
        // Открытие/закрытие меню
        burgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            mainNav.classList.toggle('active');

            const isOpen = mainNav.classList.contains('active');
            this.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        });

        // Закрытие меню при клике на пункт меню (мобильная версия)
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 968) { // Только на мобильных устройствах
                    mainNav.classList.remove('active');
                    burgerBtn.classList.remove('active');
                    burgerBtn.setAttribute('aria-label', 'Открыть меню');
                }
            });
        });

        // Закрытие меню при клике вне
        document.addEventListener('click', function (e) {
            if (mainNav.classList.contains('active')) {
                if (!mainNav.contains(e.target) && !burgerBtn.contains(e.target)) {
                    mainNav.classList.remove('active');
                    burgerBtn.classList.remove('active');
                    burgerBtn.setAttribute('aria-label', 'Открыть меню');
                }
            }
        });

        // Закрытие меню по ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                burgerBtn.classList.remove('active');
                burgerBtn.setAttribute('aria-label', 'Открыть меню');
            }
        });

        // Закрытие меню при изменении размера окна на десктоп
        window.addEventListener('resize', function () {
            if (window.innerWidth > 968 && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                burgerBtn.classList.remove('active');
                burgerBtn.setAttribute('aria-label', 'Открыть меню');
            }
        });
    }

    // ======================================================================
    // ВЕРСИЯ ДЛЯ СЛАБОВИДЯЩИХ (УПРОЩЕННАЯ)
    // ======================================================================

    const eyeToggle = document.getElementById('eyeToggle');
    const body = document.body;

    if (!eyeToggle) {
        console.warn('Кнопка для слабовидящих не найдена');
        return;
    }

    // Проверяем сохраненное состояние
    let isEyeMode = localStorage.getItem('eyeMode') === 'true';

    // Функция применения режима
    function applyEyeMode(enable) {
        if (enable) {
            body.classList.add('eye-mode-active');
            eyeToggle.classList.add('active');
            eyeToggle.innerHTML = `
                <i data-lucide="eye-off"></i>
            `;
        } else {
            body.classList.remove('eye-mode-active');
            eyeToggle.classList.remove('active');
            eyeToggle.innerHTML = `
                <i data-lucide="eye"></i>
            `;
        }

        // Сохраняем состояние
        localStorage.setItem('eyeMode', enable);

        // Обновляем иконки
        if (window.lucide && typeof lucide.createIcons === 'function') {
            setTimeout(function () {
                lucide.createIcons();
            }, 50);
        }
    }

    // Применяем сохраненное состояние при загрузке
    if (isEyeMode) {
        applyEyeMode(true);
    }

    // Обработчик клика по кнопке
    eyeToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        isEyeMode = !isEyeMode;
        applyEyeMode(isEyeMode);
    });

    // ======================================================================
    // ИНИЦИАЛИЗАЦИЯ LUCIDE ИКОНОК
    // ======================================================================

    function initIcons() {
        if (window.lucide && typeof lucide.createIcons === 'function') {
            try {
                lucide.createIcons();
                console.log('✅ Lucide иконки обновлены');
            } catch (e) {
                console.warn('Ошибка инициализации Lucide:', e);
            }
        }
    }

    // Первичная инициализация
    initIcons();

    // Повторная инициализация через задержку
    setTimeout(initIcons, 300);
    setTimeout(initIcons, 1000);

    console.log('✅ Все скрипты загружены');

}); // end DOMContentLoaded