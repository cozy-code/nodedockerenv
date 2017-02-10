var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('serve',  function () {
  nodemon({
      script: './bin/www' 
  });
});

gulp.task('default', ['serve']);