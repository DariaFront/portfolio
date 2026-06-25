// Photo Carousel
class PhotoCarousel {
    constructor() {
        this.track = document.getElementById('photoTrack');
        this.dotsContainer = document.getElementById('carouselDots');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.container = this.track ? this.track.parentElement : null;

        this.photos = this.generatePhotoList();
        this.currentIndex = 0;
        this.lightboxIndex = 0;

        this.init();
    }

    // Список фото
    generatePhotoList() {
        return [
            { src: 'img/photo/DSC02669_resized.jpg', alt: 'Фото 1' },
            { src: 'img/photo/DSC02694_resized.jpg', alt: 'Фото 2' },
            { src: 'img/photo/JYDL8RHHRjES3aJ3-YYiepOJZ2BVAwkLOGl47LO2SvDjx03kCG42u4HrCmjqcVeJnGM0szsnfrFR1tSsHoLn5Mx8.jpg', alt: 'Фото 3' },
            { src: 'img/photo/2026-02-27_12-59-55.png', alt: 'Фото 4' },
            { src: 'img/photo/bqpEC9Qz_ssvf2WzeFCzigx0U8Aunl0Lym7-SjHfpzhJqonFg0qLfomnQ2aKwPoJuwZrblHX9OUprlQkottnmtC1.jpg', alt: 'Фото 5' },
            { src: 'img/photo/DSC02354_resized.jpg', alt: 'Фото 6' },
            { src: 'img/photo/DSC02408_resized.jpg', alt: 'Фото 7' },
            { src: 'img/photo/DSC02657_resized.jpg', alt: 'Фото 8' },
            { src: 'img/photo/DSC02673_resized.jpg', alt: 'Фото 9' },
            { src: 'img/photo/image (3).png', alt: 'Фото 10' },
            { src: 'img/photo/image (4).png', alt: 'Фото 11' },
            { src: 'img/photo/image (5).png', alt: 'Фото 12' },
        ];
    }

    // ВАЖНО: брейкпоинты синхронизированы с CSS
    getPhotosPerView() {
        const w = window.innerWidth;
        if (w <= 640) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    getGap() {
        const w = window.innerWidth;
        if (w <= 640) return 12;
        if (w <= 1024) return 16;
        return 20;
    }

    get totalSlides() {
        return Math.max(1, Math.ceil(this.photos.length / this.getPhotosPerView()));
    }

    init() {
        this.renderSlides();
        this.renderDots();
        this.updateCarousel();
        this.addEventListeners();

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Если вышли за границы — корректируем
                if (this.currentIndex >= this.totalSlides) {
                    this.currentIndex = this.totalSlides - 1;
                }
                this.renderDots();
                this.updateCarousel();
            }, 120);
        });
    }

    renderSlides() {
        if (!this.track) return;
        this.track.innerHTML = '';

        const frag = document.createDocumentFragment();
        const perView = this.getPhotosPerView();

        this.photos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.setAttribute('role', 'button');
            slide.setAttribute('tabindex', '0');
            slide.setAttribute('aria-label', photo.alt);

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.alt;
            img.loading = index < perView ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.onerror = () => {
                console.warn(`Не удалось загрузить: ${photo.src}`);
                img.src = 'img/photo/photo1.jpg';
            };

            slide.appendChild(img);

            // Клик → лайтбокс
            slide.addEventListener('click', () => this.openLightbox(index));
            slide.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openLightbox(index);
                }
            });

            frag.appendChild(slide);
        });

        this.track.appendChild(frag);
    }

    renderDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';

        const total = this.totalSlides;
        // Если слайд всего один — точки не нужны
        if (total <= 1) {
            this.dotsContainer.style.display = 'none';
            return;
        }
        this.dotsContainer.style.display = 'flex';

        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === this.currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', `Перейти к слайду ${i + 1} из ${total}`);
            dot.addEventListener('click', () => {
                this.currentIndex = i;
                this.updateCarousel();
            });
            this.dotsContainer.appendChild(dot);
        }
    }

    updateCarousel() {
        if (!this.track) return;

        // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: правильная формула сдвига
        // Каждая "страница" = 100% ширины контейнера + gap между страницами
        const gap = this.getGap();
        const offset = `calc(-${this.currentIndex * 100}% - ${this.currentIndex * gap}px)`;
        this.track.style.transform = `translateX(${offset})`;

        // Состояние кнопок
        const total = this.totalSlides;
        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= total - 1;

        // Активная точка
        this.dotsContainer?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    addEventListeners() {
        this.prevBtn?.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateCarousel();
            }
        });

        this.nextBtn?.addEventListener('click', () => {
            if (this.currentIndex < this.totalSlides - 1) {
                this.currentIndex++;
                this.updateCarousel();
            }
        });

        // Свайпы (с проверкой направления — чтобы не конфликтовать со скроллом страницы)
        let startX = 0, startY = 0, isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Срабатывает только если свайп горизонтальный
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0 && this.currentIndex < this.totalSlides - 1) {
                    this.currentIndex++;
                } else if (diffX < 0 && this.currentIndex > 0) {
                    this.currentIndex--;
                }
                this.updateCarousel();
            }
            isDragging = false;
        }, { passive: true });

        // Клавиатура по track
        this.track?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentIndex > 0) {
                this.currentIndex--;
                this.updateCarousel();
            } else if (e.key === 'ArrowRight' && this.currentIndex < this.totalSlides - 1) {
                this.currentIndex++;
                this.updateCarousel();
            }
        });
    }

    // ========== LIGHTBOX ==========
    openLightbox(index) {
        this.lightboxIndex = index;
        const photo = this.photos[index];
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const img = document.getElementById('lightboxImage');
        const caption = document.getElementById('lightboxCaption');
        const counter = document.getElementById('lightboxCounter');

        img.src = photo.src;
        img.alt = photo.alt;
        caption.textContent = photo.alt;
        counter.textContent = `${index + 1} / ${this.photos.length}`;

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.preloadAdjacentImages(index);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        setTimeout(() => {
            const img = document.getElementById('lightboxImage');
            if (img) img.src = '';
        }, 300);
    }

    nextLightboxImage() {
        if (this.lightboxIndex < this.photos.length - 1) {
            this.openLightbox(this.lightboxIndex + 1);
        }
    }

    prevLightboxImage() {
        if (this.lightboxIndex > 0) {
            this.openLightbox(this.lightboxIndex - 1);
        }
    }

    preloadAdjacentImages(index) {
        [index - 1, index + 1].forEach(i => {
            if (i >= 0 && i < this.photos.length) {
                const img = new Image();
                img.src = this.photos[i].src;
            }
        });
    }

    initLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        document.getElementById('lightboxOverlay')?.addEventListener('click', () => this.closeLightbox());
        document.getElementById('lightboxClose')?.addEventListener('click', () => this.closeLightbox());
        document.getElementById('lightboxPrev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevLightboxImage();
        });
        document.getElementById('lightboxNext')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextLightboxImage();
        });

        // Глобальная клавиатура
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.prevLightboxImage();
            if (e.key === 'ArrowRight') this.nextLightboxImage();
        });

        // Свайпы в лайтбоксе
        let startX = 0;
        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextLightboxImage() : this.prevLightboxImage();
            }
        }, { passive: true });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new PhotoCarousel();
    carousel.initLightbox();
});