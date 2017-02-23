var gulp = require('gulp');
var gutil = require("gulp-util");
var spawn = require('child_process').spawn;


var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var plumber = require('gulp-plumber');

var browserify=require('browserify');
var tsify = require("tsify");
var watchify = require("watchify");

var vinyl     = require('vinyl-source-stream');
var vinyl_buf = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var ts_srcs= {
    server : { task:"server-ts", config:'tsconfig.json', src_root: './src/ts', dest: './src/js' },
    client : { task:"client-ts", config:'./public/src/tsconfig.json', 
        src_root: './public/src/ts',    // typescript source dir 
        dest: './public/src/js' ,       // javascript output target
        appJs:'app.js'  // browserify target
    }
};

var ENTRY_POINT='./src/js/www.js';

// compile server side TypeScript
gulp.task(ts_srcs.server.task, function () {
    // pull in the project TypeScript config
    let tsProject = ts.createProject(ts_srcs.server.config,
        {
            outDir: ts_srcs.server.dest,
        });

    return gulp.src(path.join(ts_srcs.server.src_root+ '/**/*.ts'))
        .pipe(plumber())
        .pipe(sourcemaps.init({ identityMap: true }))
        .pipe(tsProject()).js
        .pipe(sourcemaps.write({
            mapSources: (sourcePath, file) => {
                var src_fullpath = path.resolve(file.base, sourcePath);
                var src_root = path.resolve(file.cwd, ts_srcs.server.src_root);
                var source = path.relative(src_root, src_fullpath);
                return source; // This affects the "sources" attribute even if it is a no-op. I don't know why.
            },
            includeContent: false,
            sourceRoot: function (file) {
                //console.log('sourceRoot file=' + JSON.stringify( file )); 
                var dest_dir = path.dirname(file.history[0]);
                var ts_root = path.join(file.cwd, ts_srcs.server.src_root);
                var src_relative = path.relative(dest_dir, ts_root);
                return src_relative;
            }
        }))
        .pipe(gulp.dest(ts_srcs.server.dest));
});

// compile client side typescript
gulp.task(ts_srcs.client.task,function(){
    //https://www.typescriptlang.org/docs/handbook/gulp.html
    const bf=browserify({
        basedir: '.',
        debug: true,    //Enable source maps
        entries: [ts_srcs.client.src_root+'/main.ts'],
        cache: {},
        packageCache: {}
    }).plugin(tsify,
        {
            "module": "commonjs",
            "target": "es5",
            "noImplicitAny": false,
            "inlineSourceMap": true
        }
    );

    const wbf = watchify(bf);
    // wbf.add(ts_srcs.client.src_root+'/main.ts');
    const bundle=function(){
        console.log(ts_srcs.client.task + " bundle!!!!!");
        return wbf
            .bundle()
            .pipe(vinyl(ts_srcs.client.appJs))
            .pipe(vinyl_buf())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(ts_srcs.client.dest))
            .pipe(browserSync.stream()) //reload on browser
            ;
    };
    wbf.on('update', bundle);
    wbf.on("log", gutil.log);
    return bundle();
});

gulp.task('client:compress',function(){
    var app_js=path.join(ts_srcs.client.dest, ts_srcs.client.appJs);
    return gulp.src(app_js)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify({mangle:false, compress:false}))
        .pipe(rename('app.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/app/'));
});

gulp.task('browser-sync', function () {
    var app_js=path.join(ts_srcs.client.dest, ts_srcs.client.appJs);
    console.log("Application JS:" + app_js)
    browserSync.init({
        reloadDelay: 500,   //ms
        files: ['*.html', '*.css', 
            //app_js, 
            'views/**/*.*'
            //,'!public/src/**/*.ts'
            ],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', [ts_srcs.server.task ,ts_srcs.client.task ,'browser-sync', 'watch'], function () {
    nodemon({
        //script: './bin/www' ,
        script: path.join(ENTRY_POINT),
        ignore: [  // nodemon で監視しないディレクトリ
            'node_modules',
            'views',
            'public',
        ],
        nodeArgs: ['--debug=0.0.0.0:5858', '--nolazy'] // --debug --debug-brk=5858 '--debug=0.0.0.0:5858' '--inspect'
    });
});

gulp.task('watch', function () {
    function file_changed(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
    // watch server side typescript
    var ts_watch = gulp.watch(ts_srcs.server.src_root + '/**/*.ts', [ ts_srcs.server.task ]);
    console.log("watch " + ts_srcs.server.src_root + '/**/*.ts to run ' + ts_srcs.server.task);
    ts_watch.on('change', file_changed );

    //watch client side typescript
    // watch by watchify

    // watch client side compiled src
    // var app_js=path.join(ts_srcs.client.dest, ts_srcs.client.appJs);
    // var appJs_watch = gulp.watch(app_js, [ 'client:compress' ]);
    // console.log("watch " + app_js + ' to run client:compress');
    // appJs_watch.on('change', file_changed );


});

//gulp.task('default', ['serve']);
// http://stackoverflow.com/questions/22886682/how-can-gulp-be-restarted-upon-each-gulpfile-change
// http://qiita.com/taku_oka/items/5bfb96788ae579084a51
gulp.task('default', function() {
    var process;
    function restart() {
        if (process) process.kill();
        process = spawn('gulp', ['serve'], {stdio: 'inherit'});
    }
    gulp.watch('gulpfile.js', restart);
    restart();
});