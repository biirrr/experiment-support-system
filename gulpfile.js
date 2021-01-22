const autoprefixer = require('gulp-autoprefixer'),
      concat = require('gulp-concat'),
      { exec, spawn } = require('child_process'),
      gulp = require('gulp'),
      sass = require('gulp-sass'),
      pump = require('pump');

gulp.task('javascript:apps:experiment-editor:watch', function(cb) {
    const builder = spawn('yarn', ['build', '--mode development', '--watch', '--no-clean'], {
        cwd: 'src/js/apps/experiment-editor',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:experiment-editor:copy', function(cb) {
    pump([
        gulp.src('src/js/apps/experiment-editor/dist/js/*.*', { base: 'src/js/apps/experiment-editor/dist/' }),
        gulp.dest('src/ess/static/experiment-editor'),
    ], cb);
});

gulp.task('javascript:apps:questions-admin:watch', function(cb) {
    const builder = spawn('yarn', ['build', '--mode development', '--watch', '--no-clean'], {
        cwd: 'src/js/apps/questions-admin',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:questions-admin:copy', function(cb) {
    pump([
        gulp.src('src/js/apps/questions-admin/dist/js/*.*', { base: 'src/js/apps/questions-admin/dist/' }),
        gulp.dest('src/ess/static/questions-admin'),
    ], cb);
});

gulp.task('javascript:apps:frontend:watch', function(cb) {
    const builder = spawn('yarn', ['build', '--mode development', '--watch', '--no-clean'], {
        cwd: 'src/js/apps/frontend',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:frontend:copy', function(cb) {
    pump([
        gulp.src('src/js/apps/frontend/dist/js/*.*', { base: 'src/js/apps/frontend/dist/' }),
        gulp.dest('src/ess/static/frontend'),
    ], cb);
});

gulp.task('javascript:apps:watch', gulp.parallel('javascript:apps:experiment-editor:watch',
                                                 'javascript:apps:questions-admin:watch',
                                                 'javascript:apps:frontend:watch'));
gulp.task('javascript:apps:copy', gulp.parallel('javascript:apps:experiment-editor:copy',
                                                'javascript:apps:questions-admin:copy',
                                                'javascript:apps:frontend:copy'));

gulp.task('javascript:apps:experiment-editor', function(cb) {
    const builder = spawn('yarn', ['build', '--mode production'], {
        cwd: 'src/js/apps/experiment-editor',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:questions-admin', function(cb) {
    const builder = spawn('yarn', ['build', '--mode production'], {
        cwd: 'src/js/apps/questions-admin',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps:frontend', function(cb) {
    const builder = spawn('yarn', ['build', '--mode production'], {
        cwd: 'src/js/apps/frontend',
        stdio: 'inherit',
    });
    builder.on('exit', cb);
});

gulp.task('javascript:apps', gulp.parallel('javascript:apps:experiment-editor',
                                           'javascript:apps:questions-admin',
                                           'javascript:apps:frontend'));

gulp.task('javascript:plugins', function(cb) {
    pump([
        gulp.src('src/js/plugins/*.js'),
        concat('plugins.js'),
        gulp.dest('src/ess/static'),
    ], cb);
});

gulp.task('javascript', gulp.parallel('javascript:plugins', gulp.series('javascript:apps', 'javascript:apps:copy')));

gulp.task('theme:static', function(cb) {
    pump([
        gulp.src('src/theme/static/**/*.*'),
        gulp.dest('src/ess/static'),
    ], cb);
});

gulp.task('theme:styles', function(cb) {
    pump([
        gulp.src([
            'src/theme/backend.scss',
            'src/theme/frontend.scss',
        ]),
        sass({
            includePaths: ['node_modules/foundation-sites/scss'],
        }),
        autoprefixer({
            cascade: false,
        }),
        gulp.dest('src/ess/static/'),
    ], cb);
});

gulp.task('theme', gulp.parallel('theme:static', 'theme:styles'));

gulp.task('default', gulp.parallel('theme', 'javascript'));

gulp.task('watch', gulp.series('default', gulp.parallel('javascript:apps:watch', function(cb) {
    gulp.watch('src/theme/**/*.*', gulp.series('theme'));
    gulp.watch('src/js/plugins/**/*.js', gulp.series('javascript:plugins'));
    gulp.watch('src/js/apps/*/dist/js/*.*',
        {delay: 1000, events: ['add', 'change']},
        gulp.series('javascript:apps:copy'),
    );
    cb();
})));
