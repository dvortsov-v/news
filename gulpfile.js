'use strict';

/* параметры для gulp-autoprefixer */
var autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];

/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
    build: {
        pug: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        libs: 'build/libs/'
    },
    src: {
        pug: 'src/template/pages/*/*.pug',
        js: 'src/js/main.js',
        style: 'src/style/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        libs: 'src/libs/**/*.*'
    },
    watch: {
        pug: ['src/template/**/*.pug',  'src/**/*.pug'],
        js: 'src/js/**/*.js',
        css: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        css_build: 'build/css/*.css',
        js_build: 'build/js/*.js'
    },
    clean: './build/*'
};

/* настройки сервера */
var config = {
    server: {
        baseDir: './build'
    },
    notify: false,
    version: {
        value: '%MDS%',
        append: {
            key: 'v',
            to: ['css', 'js'],
        },
    }
};

/* подключаем gulp и плагины */
var gulp = require('gulp'),                                 // подключаем Gulp
    webserver = require('browser-sync'),                    // сервер для работы и автоматического обновления страниц
    plumber = require('gulp-plumber'),                      // модуль для отслеживания ошибок
    rigger = require('gulp-rigger'),                        // модуль для импорта содержимого одного файла в другой
    sass = require('gulp-sass'),                            // модуль для компиляции SASS (SCSS) в CSS
    autoprefixer = require('gulp-autoprefixer'),            // модуль для автоматической установки автопрефиксов
    cleanCSS = require('gulp-clean-css'),                   // плагин для минимизации CSS
    uglify = require('gulp-uglify-es').default,             // модуль для минимизации JavaScript
    cache = require('gulp-cache'),                          // модуль для кэширования
    imagemin = require('gulp-imagemin'),                    // плагин для сжатия PNG, JPEG, GIF и SVG изображений
    jpegrecompress = require('imagemin-jpeg-recompress'),   // плагин для сжатия jpeg
    pngquant = require('imagemin-pngquant'),                // плагин для сжатия png
    rimraf = require('gulp-rimraf'),                        // плагин для удаления файлов и каталогов
    pug = require('gulp-pug'),
    rename = require('gulp-rename');

/* задачи */

// запуск сервера
gulp.task('webserver', function () {
    webserver(config);
});

// сбор pug
gulp.task('pug:build', function () {
    return gulp.src(path.src.pug)                  // выбор всех pug файлов по указанному пути
        .pipe(plumber())                            // отслеживание ошибок
        .pipe(pug({
            pretty: true
        }))                          // импорт вложений
        .pipe(gulp.dest(path.build.pug))           // выкладывание готовых файлов
        .pipe(webserver.reload({ stream: true }));  // перезагрузка сервера
});

// сбор стилей
gulp.task('css:build', function () {
    return gulp.src(path.src.style)     // получим main.scss
        .pipe(plumber())                // для отслеживания ошибок
        .pipe(sass())                   // scss -> css
        .pipe(autoprefixer({            // добавим префиксы
            overrideBrowserslist: autoprefixerList
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())                           // минимизируем CSS
        .pipe(gulp.dest(path.build.css))            // выгружаем в build
        .pipe(webserver.reload({ stream: true }));  // перезагрузим сервер
});

// сбор js
gulp.task('js:build', function () {
    return gulp.src(path.src.js)                    // получим файл main.js
        .pipe(plumber())                            // для отслеживания ошибок
        .pipe(rigger())                             // импортируем все указанные файлы в main.js
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())                             // минимизируем js
        .pipe(gulp.dest(path.build.js))             // положим готовый файл
        .pipe(webserver.reload({ stream: true }));  // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// обработка картинок
gulp.task('image:build', function () {
    return gulp.src(path.src.img)                       // путь с исходниками картинок
        .pipe(cache(imagemin([                          // сжатие изображений
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
        ])))
        .pipe(gulp.dest(path.build.img));               // выгрузка готовых файлов
});

// удаление каталога build
gulp.task('clean:build', function () {
    return gulp.src(path.clean, { read: false })
        .pipe(rimraf());
});

// очистка кэша
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// сборка
gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'pug:build',
            'css:build',
            'js:build',
            'fonts:build',
            'image:build',
        )
    )
);

// запуск задач при изменении файлов
gulp.task('watch', function () {
    gulp.watch(path.watch.pug, gulp.series('pug:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
    gulp.watch(path.watch.css_build).on('change', webserver.reload);
    gulp.watch(path.watch.js_build).on('change', webserver.reload);
});

// задача по умолчанию
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')
));
