
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';


const swiper = new Swiper('.swiper', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true
    },
    spaceBetween: 30,
    breakpoints: {
        // когда ширина окна браузера больше или равна 640px
        640: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        // когда ширина окна браузера больше или равна 768px
        768: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
        // когда ширина окна браузера больше или равна 1024px
        1024: {
            slidesPerView: 4,
            spaceBetween: 40,
        },

    }
});



// function myPlugin({ swiper, extendParams, on }) {
//     extendParams({
//         debugger: false,
//     });

//     on('init', () => {
//         if (!swiper.params.debugger) return;
//         console.log('init');
//     });
//     on('click', (swiper, e) => {
//         if (!swiper.params.debugger) return;
//         console.log('click');
//     });
//     on('tap', (swiper, e) => {
//         if (!swiper.params.debugger) return;
//         console.log('tap');
//     });
//     on('doubleTap', (swiper, e) => {
//         if (!swiper.params.debugger) return;
//         console.log('doubleTap');
//     });
//     on('sliderMove', (swiper, e) => {
//         if (!swiper.params.debugger) return;
//         console.log('sliderMove');
//     });
//     on('slideChange', () => {
//         if (!swiper.params.debugger) return;
//         console.log(
//             'slideChange',
//             swiper.previousIndex,
//             '->',
//             swiper.activeIndex
//         );
//     });
//     on('slideChangeTransitionStart', () => {
//         if (!swiper.params.debugger) return;
//         console.log('slideChangeTransitionStart');
//     });
//     on('slideChangeTransitionEnd', () => {
//         if (!swiper.params.debugger) return;
//         console.log('slideChangeTransitionEnd');
//     });
//     on('transitionStart', () => {
//         if (!swiper.params.debugger) return;
//         console.log('transitionStart');
//     });
//     on('transitionEnd', () => {
//         if (!swiper.params.debugger) return;
//         console.log('transitionEnd');
//     });
//     on('fromEdge', () => {
//         if (!swiper.params.debugger) return;
//         console.log('fromEdge');
//     });
//     on('reachBeginning', () => {
//         if (!swiper.params.debugger) return;
//         console.log('reachBeginning');
//     });
//     on('reachEnd', () => {
//         if (!swiper.params.debugger) return;
//         console.log('reachEnd');
//     });
// }

