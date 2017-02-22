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
    server : { task:"server-ts", config:'tsconfig.json', src: './src/ts', dest: './src/js' },
    client : { task:"client-ts", config:'./public/src/tsconfig.json', src: './public/src/ts', dest: './public/src/js'}
};

var ENTRY_POINT='./src/js/www.js';

gulp.task(ts_srcs.server.task, function () {
    return ts_compile(ts_srcs.server);
});

// gulp.task(ts_srcs.client.task, function () {
//     var src=ts_srcs.client;
//     let tsProject = ts.createProject(src.config,
//     {
//         outDir: src.dest,
//     });

//     return gulp.src(path.join(src.src+ '/**/*.ts'))
//         .pipe(plumber())
//         .pipe(sourcemaps.init({ identityMap: true }))
//         .pipe(tsProject()).js
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest(src.dest));        
// });

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
gulp.task('client:bundle',function(){
    //https://www.typescriptlang.org/docs/handbook/gulp.html
    const bf=browserify({
        basedir: '.',
        debug: true,
        //entries: [ts_srcs.client.src+'/main.ts'],
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
    wbf.add(ts_srcs.client.src+'/main.ts');
    const bundle=function(){
        console.log("client:bundle bundle!!!!!");
        return wbf
            .bundle()
            .pipe(vinyl('app.js'))
            .pipe(vinyl_buf())
//            .pipe(sourcemaps.init({loadMaps: true}))
//            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(ts_srcs.client.dest))
            // .on('end',function(){ //http://blog.anatoo.jp/entry/20140420/1397995711
            //     gulp.src(ts_srcs.client.dest + '/app.js')
            //         .pipe(sourcemaps.init({loadMaps: true}))
            //         .pipe(uglify())
            //         .pipe(rename('app.min.js'))
            //         .pipe(sourcemaps.write('./'))
            //         .pipe(gulp.dest('./public/app/'));
            // })
            ;
    };
    wbf.on('update', bundle);
    wbf.on("log", gutil.log);
    return bundle();
});

gulp.task(ts_srcs.client.task, ['client:bundle']);

gulp.task('client:compress',[ts_srcs.client.task],function(){
    return gulp.src(ts_srcs.client.dest + '/app.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/app/'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        reloadDelay: 500,   //ms
        files: ['*.html', '*.css', 'public/src/js/app.js.map', 'views/**/*.*'
            ,'!public/src/**/*.ts'
            ],
        proxy: 'http://localhost:3000',
        port: 4000,  // BrowserSync open 4000
        open: false
    });
});

gulp.task('serve', [ts_srcs.server.task ,'client:bundle' ,'browser-sync', 'watch'], function () {
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
    var task=ts_srcs.server.watchHandle ? ts_srcs.server.watchHandle : ts_srcs.server.task;
    var ts_watch = gulp.watch(ts_srcs.server.src + '/**/*.ts', [ task ]);
    console.log("watch " + ts_srcs.server.src + '/**/*.ts to run ' +task);
    ts_watch.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

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