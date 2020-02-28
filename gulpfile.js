var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    pump = require('pump');

/*gulp.task('frontend:apps:workbench', function(cb) {
    pump([
        gulp.src([
            'src/frontend/apps/workbench/dist/js/*.js',
            'src/frontend/apps/workbench/dist/js/*.js.map',
        ]),
        gulp.dest('src/toja/static/workbench')
    ], cb);
});

gulp.task('frontend:apps', gulp.parallel('frontend:apps:workbench'));
*/
gulp.task('javascript:plugins', function(cb) {
    pump([
        gulp.src('src/js/plugins/*.js'),
        concat('plugins.js'),
        gulp.dest('src/ess/static')
    ], cb);
});

gulp.task('javascript', gulp.parallel('javascript:plugins'));


gulp.task('theme:static', function(cb) {
    pump([
        gulp.src('src/theme/static/**/*.*'),
        gulp.dest('src/ess/static')
    ], cb);
});

gulp.task('theme:styles', function(cb) {
    pump([
        gulp.src([
            'src/theme/backend.scss'
        ]),
        sass({
            includePaths: ['node_modules/foundation-sites/scss']
        }),
        autoprefixer({
            cascade: false
        }),
        gulp.dest('src/ess/static/')
    ], cb);
});

gulp.task('theme', gulp.parallel('theme:static', 'theme:styles'));

gulp.task('default', gulp.parallel('theme', 'javascript'));

gulp.task('watch', gulp.series('default', function(cb) {
    gulp.watch('src/theme/**/*.*', gulp.series('theme'));
    gulp.watch('src/js/plugins/**/*.js', gulp.series('javascript:plugins'));
    //gulp.watch('src/frontend/apps/**/dist/js/*.js', {'delay': 1000, 'events': ['add', 'change']}, gulp.series('frontend:apps'));
    cb();
}));
