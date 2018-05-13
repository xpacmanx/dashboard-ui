'use strict';

var gulp = require('gulp'),
    path = require('path'),
    del = require('del'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    portfinder = require('portfinder'),
    postcss = require('gulp-postcss'),
    precss = require('precss'),
    cssnext = require('postcss-cssnext'),
    nano = require('gulp-cssnano'),
    browserSync = require("browser-sync"),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    pug = require('gulp-pug'),
    inline  = require('postcss-inline-svg'),
    cache = require('gulp-cached'),
    image = require('gulp-imagemin'),
    cachebust = require('gulp-cache-bust'),
    eslint = require('gulp-eslint'),
    babel = require("gulp-babel"),
    reload = browserSync.reload,
    sass = require('gulp-sass');

var processors = [
  precss(),
  cssnext(),
  inline()
];

// Ресурсы проекта
var paths = {
  styles: 'assets/sass/',
  css: 'assets/css/',
  scripts: 'assets/source/scripts/',
  js: 'assets/js/',
  templates: 'templates/',
  img: 'assets/source/img/',
  bundles: 'assets/img/',
  html: './'
};

// Запуск живой сборки
gulp.task('live', function () {
  gulp.start('pug','styles', 'watch', 'server');
});

// Запуск живой сборки
gulp.task('tunel', function () {
  gulp.start('styles', 'scripts', 'watch', 'server-tunel');
});


// Федеральная служба по контролю за оборотом файлов
gulp.task('watch', function () {
  gulp.watch('./*.html', ['pug']);
  gulp.watch(paths.styles + '**/*.scss', ['styles']);
});

// Шаблонизация
gulp.task('pug', function() {
  gulp.src('./*.html')
    .pipe(reload({stream: true}));
});

// // Компиляция стилей, добавление префиксов
// gulp.task('styles', function () {
//   gulp.src(paths.styles + 'light-bootstrap-dashboard.scss')
//     .pipe(plumber({errorHandler: onError}))
//     .pipe(postcss(processors))
//     .pipe(rename('style.css'))
//     .pipe(nano({convertValues: {length: false}}))
//     .pipe(gulp.dest(paths.css))
//     .pipe(reload({stream: true}));
// });

gulp.task('styles', function () {
  gulp.src('./assets/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'))
    .pipe(reload({
      stream: true
    }));
});

// Lint for god sick
gulp.task('styles:lint', function () {
  gulp.src(paths.styles + '**.scss')
    .pipe(postcss([
      require('stylelint')(),
      require('postcss-reporter')({clearMessages: true})]
    ));
});

// Сборка и минификация скриптов
gulp.task('scripts', function() {
  gulp.src(paths.scripts + '*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel())
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js))
    .pipe(reload({stream: true}));
});

// Локальный сервер
gulp.task('server', function() {
  portfinder.getPort(function (err, port) {
    browserSync({
      server: {
        baseDir: "."
      },
      host: 'localhost',
      notify: false,
      port: port
    });
  });
});

// Локальный сервер c туннелем в интернет
gulp.task('web-server', function() {
  portfinder.getPort(function (err, port) {
    browserSync({
      server: {
        baseDir: "."
      },
      tunnel: true,
      host: 'localhost',
      notify: false,
      port: port
    });
  });
});

// Ошибки
var onError = function(error) {
  gutil.log([
    (error.name + ' in ' + error.plugin).bold.red,
    '',
    error.message,
    ''
  ].join('\n'));
  gutil.beep();
  this.emit('end');
};
