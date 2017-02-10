var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
    browserSync.init({
        files:['*.html', '*.css', '*.js','public/**/*.*', 'views/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', ['browser-sync'], function () {
  nodemon({
      script: './bin/www' ,
      nodeArgs: ['--debug']
  });
});


gulp.task('default', ['serve']);