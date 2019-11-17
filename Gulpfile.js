const gulp = require('gulp');
const typescript = require('gulp-typescript');
const umd = require('gulp-umd');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const del = require('del');

gulp.task('compile', function () {
  const project = typescript.createProject('tsconfig.json');
  return gulp.src('src/**/*.ts')
      .pipe(project())
      .pipe(umd())
      .pipe(gulp.dest('bin'));
});

gulp.task('uglify', function () {
  return gulp.src('bin/mvc.js')
      .pipe(uglify())
      .pipe(rename('mvc.min.js'))
      .pipe(gulp.dest('bin'));
});

gulp.task('default', gulp.series(['compile', 'uglify']));

gulp.task('clean', function () {
  return del('bin');
});
