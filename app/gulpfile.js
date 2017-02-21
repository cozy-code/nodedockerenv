var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var plumber = require('gulp-plumber');

var browserify=require('browserify');
var vinyl     = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var SERVER_TS=0;
var CLIENT_TS=1;
var ts_srcs=[
    { task:"server-ts", config:'tsconfig.json', src: './src/ts', dest: './src/js' },
    { task:"client-ts", config:'./public/src/tsconfig.json', src: './public/src/ts', dest: './public/src/js' ,watchHandle: 'client:compress'}
];

var ENTRY_POINT='./src/js/www.js';

gulp.task(ts_srcs[SERVER_TS].task, function () {
    return ts_compile(ts_srcs[SERVER_TS]);
});

gulp.task(ts_srcs[CLIENT_TS].task, function () {
    return ts_compile(ts_srcs[CLIENT_TS]);
});

function ts_compile(src) {
    // pull in the project TypeScript config
    let tsProject = ts.createProject(src.config,
        {
            outDir: src.dest,
        });

    return gulp.src(path.join(src.src+ '/**/*.ts'))
        .pipe(plumber())
        .pipe(sourcemaps.init({ identityMap: true }))
        .pipe(tsProject()).js
        .pipe(sourcemaps.write({
            mapSources: (sourcePath, file) => {
                var src_fullpath = path.resolve(file.base, sourcePath);
                var src_root = path.resolve(file.cwd, src.src);
                var source = path.relative(src_root, src_fullpath);
                return source; // This affects the "sources" attribute even if it is a no-op. I don't know why.
            },
            includeContent: false,
            sourceRoot: function (file) {
                //console.log('sourceRoot file=' + JSON.stringify( file )); 
                var dest_dir = path.dirname(file.history[0]);
                var ts_root = path.join(file.cwd, src.src);
                var src_relative = path.relative(dest_dir, ts_root);
                return src_relative;
            }
        }))
        .pipe(gulp.dest(src.dest));
    //.pipe(gulp.dest(TS_SRC_ROOT));
}

gulp.task('client:bundle',[ts_srcs[CLIENT_TS].task], function(){
    // Single entry point to browserify 
    var app_entry_point=ts_srcs[CLIENT_TS].dest+'/main.js';
    console.log('Application entry point:' + app_entry_point);

    return browserify({entries:[app_entry_point]})
            .bundle()
            .pipe(vinyl('app.js'))
            .pipe(gulp.dest(ts_srcs[CLIENT_TS].dest));
});

gulp.task('client:compress',['client:bundle'],function(){
    return gulp.src(ts_srcs[CLIENT_TS].dest + '/app.js')
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('./public/app/'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        files: ['*.html', '*.css', '*.js', 'public/**/*.*', 'views/**/*.*','!public/src/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', ['server-ts','client:compress','browser-sync', 'watch'], function () {
    nodemon({
        //script: './bin/www' ,
        script: path.join(ENTRY_POINT),
        nodeArgs: ['--debug=0.0.0.0:5858', '--nolazy'] // --debug --debug-brk=5858 '--debug=0.0.0.0:5858' '--inspect'
    });
});

gulp.task('watch', function () {
    for(var i=0;i<ts_srcs.length;i++){
        var src=ts_srcs[i];
        var task=src.watchHandle ? src.watchHandle : src.task;
        var ts_watch = gulp.watch(src.src + '/**/*.ts', [ task ]);
        console.log("watch " + src.src + '/**/*.ts to run ' +task);
        ts_watch.on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
    }
});

gulp.task('default', ['serve']);