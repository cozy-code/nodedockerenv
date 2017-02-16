var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var path=require('path');
var TS_SRC_ROOT ='./src/ts';
var TS_SRC = TS_SRC_ROOT  + '/**/*.ts';
var JS_DEST = './src/js/';

gulp.task("ts-compile", function () {
    // pull in the project TypeScript config
    let tsProject = ts.createProject('tsconfig.json',
                {
                    outDir: JS_DEST,
                });

     return gulp.src(TS_SRC)
        .pipe(sourcemaps.init({identityMap:true}))
        .pipe(tsProject()).js
        // // https://github.com/floridoo/gulp-sourcemaps/issues/174
        // .pipe(sourcemaps.write('./', {
        //     mapSources: (p) => path.basename(p), // This affects the "sources" attribute even if it is a no-op. I don't know why.
        // }))
        //https://www.npmjs.com/package/gulp-sourcemaps#write-inline-source-maps
        // http://stackoverflow.com/a/34985647
        .pipe(sourcemaps.write({
            //mapSources: (p) => path.basename(p), // This affects the "sources" attribute even if it is a no-op. I don't know why.
            mapSources: (sourcePath, file) =>{
                var dist_dir=path.dirname(file.history[0]);
                var src_fullpath=path.resolve(file.base, sourcePath);
                var map_path=path.relative(dist_dir,src_fullpath); 
                var src_root=path.resolve(file.cwd,TS_SRC_ROOT);
                var source=path.relative(src_root,src_fullpath);
                // console.log('sourcePath=' + JSON.stringify( sourcePath )); 
                // console.log('file=' + JSON.stringify( file )); 
                // console.log('dist_dir=' + dist_dir); 
                // console.log('src_fullpath=' + src_fullpath);
                // console.log('map_path=' + map_path);
                // console.log('src_root=' + src_root);
                // console.log('source=' + source);
                return source; // This affects the "sources" attribute even if it is a no-op. I don't know why.
            },
            includeContent:false,
            sourceRoot: function(file,arg2){
                console.log('sourceRoot file=' + JSON.stringify( file )); 
                var dist_dir=path.dirname(file.history[0]);
                var sourcePath=file.sourceMap.sources[0];
                var ts_root = path.join(file.cwd,TS_SRC_ROOT);
                var src_fullpath=path.resolve(file.base, sourcePath);
                var src_relative=path.relative( dist_dir , ts_root);
                
                var src_dir=path.dirname(src_relative);

                console.log('sourceRoot src_relative=' + src_relative); 
                console.log('sourceRoot src_fullpath=' + src_fullpath); 
                console.log('sourceRoot src_dir=' + src_dir); 
                return src_relative;
            }
            // sourceRoot:"../ts",
            //sourceRoot:"/Users/pkjit/src/nodeenv/app/src/ts"
        }))
        .pipe(gulp.dest(JS_DEST));
        //.pipe(gulp.dest(TS_SRC_ROOT));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        files:['*.html', '*.css', '*.js','public/**/*.*', 'views/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', ['ts-compile','browser-sync','watch'], function () {
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

gulp.task('default', ['serve']);