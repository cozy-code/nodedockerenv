var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var plumber = require('gulp-plumber');

var browserify=require('browserify');
var vinyl     = require('vinyl-source-stream');

var SERVER_TS=0;
var CLIENT_TS=1;
var ts_srcs=[
    { task:"server-ts", config:'tsconfig.json', src: './src/ts', dest: './src/js' },
    { task:"client-ts", config:'./clients/tsconfig.json', src: './clients/ts', dest: './public/app' ,watchHandle: 'client:bundle'}
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
        // // https://github.com/floridoo/gulp-sourcemaps/issues/174
        // .pipe(sourcemaps.write('./', {
        //     mapSources: (p) => path.basename(p), // This affects the "sources" attribute even if it is a no-op. I don't know why.
        // }))
        //https://www.npmjs.com/package/gulp-sourcemaps#write-inline-source-maps
        // http://stackoverflow.com/a/34985647
        .pipe(sourcemaps.write({
            //mapSources: (p) => path.basename(p), // This affects the "sources" attribute even if it is a no-op. I don't know why.
            mapSources: (sourcePath, file) => {
                var dest_dir = path.dirname(file.history[0]);
                var src_fullpath = path.resolve(file.base, sourcePath);
                var map_path = path.relative(dest_dir, src_fullpath);
                var src_root = path.resolve(file.cwd, src.src);
                var source = path.relative(src_root, src_fullpath);
                // console.log('sourcePath=' + JSON.stringify( sourcePath )); 
                // console.log('file=' + JSON.stringify( file )); 
                // console.log('dest_dir=' + dest_dir); 
                // console.log('src_fullpath=' + src_fullpath);
                // console.log('map_path=' + map_path);
                // console.log('src_root=' + src_root);
                // console.log('source=' + source);
                return source; // This affects the "sources" attribute even if it is a no-op. I don't know why.
            },
            includeContent: false,
            sourceRoot: function (file) {
                //console.log('sourceRoot file=' + JSON.stringify( file )); 
                var dest_dir = path.dirname(file.history[0]);
                var sourcePath = file.sourceMap.sources[0];
                if (!sourcePath) {
                    return src.src;
                }
                var ts_root = path.join(file.cwd, src.src);
                var src_fullpath = path.resolve(file.base, sourcePath);
                var src_relative = path.relative(dest_dir, ts_root);

                var src_dir = path.dirname(src_relative);

                // console.log('sourceRoot file=' + JSON.stringify( file )); 
                // console.log('sourceRoot src_relative=' + src_relative); 
                // console.log('sourceRoot src_fullpath=' + src_fullpath); 
                // console.log('sourceRoot src_dir=' + src_dir); 
                return src_relative;
            }
            // sourceRoot:"../ts",
            //sourceRoot:"/Users/pkjit/src/nodeenv/app/src/ts"
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

gulp.task('browser-sync', function () {
    browserSync.init({
        files: ['*.html', '*.css', '*.js', 'public/**/*.*', 'views/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', ['server-ts','client:bundle','browser-sync', 'watch'], function () {
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