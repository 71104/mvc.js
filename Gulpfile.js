const gulp = require('gulp');
const typescript = require('gulp-typescript');
const umd = require('gulp-umd');
const del = require('del');

gulp.task('default', function () {
  const project = typescript.createProject('tsconfig.json');
  return gulp.src('src/**/*.ts')
      .pipe(project())
      .pipe(umd())
      .pipe(gulp.dest('bin'));
});

gulp.task('clean', function () {
  return del('bin');
});
