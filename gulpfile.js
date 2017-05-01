var gulp = require('gulp');

var browserify = require('browserify-incremental');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

var babel = require('gulp-babel');
var cache = require('gulp-cached');
var nodemon = require('gulp-nodemon');
var rename = require("gulp-rename");

gulp.task('app', () => {
  return gulp.src('src/*')
  .pipe(cache('app'))
  .pipe(babel({presets: ['es2015', 'stage-3']}))
  .on('error', onError)
  .pipe(gulp.dest('build'))
});


var js = (
  browserify({entries: ['./js/index.js'], debug: true, ignoreMissing: true})
  .transform(babelify, {
    presets: ['es2015', 'stage-3', 'react'],
    sourceMaps: true
  })
);

gulp.task('js', () => {
  return js.bundle()
  .on('error', onError)
  .pipe(source('main.js'))
  .pipe(gulp.dest('public'));
});


gulp.task('css', () => {
  return gulp.src('./css/index.less')
  .pipe(less({strictMath: true, paths: [ './css' ]}))
  .on('error', onError)
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(rename('main.css'))
  .pipe(gulp.dest('public'));
});


function onError(err) {
  console.log(err.message);
  this.emit('end');
}


gulp.task('serve', ['app', 'js', 'css'], () => {
  gulp.watch('css/**/*.less',{cwd:'./'}, ['css']);
  gulp.watch('js/**/*.js',{cwd:'./'}, ['js']);
  gulp.watch('src/**/*.js',{cwd:'./'}, ['app']);

  nodemon({
    script: 'build/app.js',
    watch: 'build',
    env: { 'NODE_PATH': './node_modules' }
  })
});


