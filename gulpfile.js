const autoprefixer = require('gulp-autoprefixer'),
      concat = require('gulp-concat'),
      { exec, spawn } = require('child_process'),
      gulp = require('gulp'),
      sass = require('gulp-sass'),
      pump = require('pump');

gulp.task('javascript:apps:experiment-editor:watch', function(cb) {
    const builder = spawn('yarn', ['build', '--mode production', '--watch', '--no-clean'], {
        cwd: 'src/js/apps/experiment-editor',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:experiment-editor:copy', function(cb) {
    pump([
        gulp.src('src/js/apps/experiment-editor/dist/js/*.*', { base: 'src/js/apps/experiment-editor/dist/' }),
        gulp.dest('src/ess/static/experiment-editor')
    ], cb);
});

gulp.task('javascript:apps:watch', gulp.parallel('javascript:apps:experiment-editor:watch'));
gulp.task('javascript:apps:copy', gulp.parallel('javascript:apps:experiment-editor:copy'));

gulp.task('javascript:apps:experiment-editor', function(cb) {
    const builder = spawn('yarn', ['build', '--mode production'], {
        cwd: 'src/js/apps/experiment-editor',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps', gulp.parallel('javascript:apps:experiment-editor'));

gulp.task('javascript:plugins', function(cb) {
    pump([
        gulp.src('src/js/plugins/*.js'),
        concat('plugins.js'),
        gulp.dest('src/ess/static')
    ], cb);
});

gulp.task('javascript', gulp.parallel('javascript:plugins', gulp.series('javascript:apps', 'javascript:apps:copy')));

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

gulp.task('watch', gulp.series('default', gulp.parallel('javascript:apps:watch', function(cb) {
    gulp.watch('src/theme/**/*.*', gulp.series('theme'));
    gulp.watch('src/js/plugins/**/*.js', gulp.series('javascript:plugins'));
    gulp.watch('src/js/apps/*/dist/js/*.*',
        {delay: 1000, events: ['add', 'change']},
        gulp.series('javascript:apps:copy')
    );
    cb();
})));
