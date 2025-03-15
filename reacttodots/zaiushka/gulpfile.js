const { dest, src, watch, series, gulp } = require('gulp')
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSynk = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-image');
const babel = require('gulp-babel');
// const uglify = require('gulp-uglify-es').default;
// const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const gulpFont = require('gulp-font');

const jsdist = () => {
  return gulp.src('main.js').pipe(gulp.dest('dist'));
}

const font = () => {
  return src(['src/fonts/**.woff',
    'src/fonts/**.woff2'
  ], { encoding: false })
    .pipe(dest('dist/fonts'));
}

const clean = () => {
  return del(['dist'])
}

const stylesSass = () => {
  return src('src/css/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'));

}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(dest('dist'))
    .pipe(browserSynk.stream())
}

const styles = () => {
  return src('dist/css/**.css')
    .pipe(sourcemaps.init())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
    .pipe(browserSynk.stream())
}

const svgSprites = () => {
  return src('src/image/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: 'sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/image/svg'))
}

const images = () => {
  return src([
    'src/image//*.jpg',
    'src/image//*.jpeg',
    'src/image//*.png',
    'src/image//*.svg',
  ], { encoding: false })
    .pipe(image())
    .pipe(dest('dist/image'))
    .pipe(browserSynk.stream())
}

const resources = () => {
  return src('src/resources/**', { encoding: false })
    .pipe(dest('dist/resources'))
}

const wathcFiles = () => {
  browserSynk.init({
    server: {
      baseDir: 'dist',
    }
  })
}

watch('src/css/**/*.sass', stylesSass);
watch('src/styles/**/*.css', styles);
watch('src/**/*.html', htmlMinify);
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/resourses/**', resources);

exports.font = font
exports.styles = styles
exports.stylesSass = stylesSass
exports.htmlMinify = htmlMinify
exports.default = series(clean, htmlMinify, jsdist, font, stylesSass, styles, images, svgSprites, resources, wathcFiles);


