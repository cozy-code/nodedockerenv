var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var path=require('path');

var TS_SRC = './src/ts/**/*.ts';
var JS_DEST = './src/js/';

gulp.task("ts-compile", function () {
    // pull in the project TypeScript config
    let tsProject = ts.createProject('tsconfig.json');
     return gulp.src(TS_SRC)
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        // https://github.com/floridoo/gulp-sourcemaps/issues/174
        .pipe(sourcemaps.write('./', {
            mapSources: (p) => path.basename(p), // This affects the "sources" attribute even if it is a no-op. I don't know why.
        }))
        .pipe(gulp.dest(JS_DEST));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        files:['*.html', '*.css', '*.js','public/**/*.*', 'views/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', ['browser-sync','watch'], function () {
  nodemon({
      script: './bin/www' ,
      nodeArgs: ['--debug=0.0.0.0:5858','--nolazy'] // --debug --debug-brk=5858 '--debug=0.0.0.0:5858' '--inspect'
  });
});

gulp.task('watch',function(){
    var ts_watch= gulp.watch(TS_SRC,['ts-compile']);
    ts_watch.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['ts-compile','serve']);