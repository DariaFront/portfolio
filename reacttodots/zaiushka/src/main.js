new Swiper('.swiper', {
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
        320: {
            slidesPerView: 1,
        },
        700: {
            slidesPerView: 1,
        }
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

