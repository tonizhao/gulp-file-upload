var gulp            = require('gulp');
var rename          = require('gulp-rename');
var _               = require('underscore');
var gulpUtil        = require('gulp-util');
var gulpDebug       = require('gulp-debug');
var lineReader      = require('line-reader');
var gulpPrompt      = require('gulp-prompt');
var jsdiff          = require('diff');
var fs              = require('fs');

var uploadProcess    = require('./uploadProcess');
var _upload = new uploadProcess

//开始上传
gulp.task('upload', function() {
    _upload.upload();
});

//得到命令行参数
var argv = process.argv;
// console.log(argv);
var taskParam = {};
for(var i=0,l=argv.length;i<l;i++) {
    if(argv[i].indexOf('-') == 0) {
        if(argv[i+1] && argv[i+1].indexOf('-') == 0) {
            taskParam[argv[i]] = ''
        }
        else {
            taskParam[argv[i]] = taskParam[argv[i+1]] || '';
        }
    }
}

//console.log(taskParam);

//监控文件变化
gulp.task('watch', function() {
    gulp.watch(['node/**','htdocs/**']).on('change', function(event) {
        gulp.src(event.path).pipe(uploadProcess.uploadProcess(function(e,d) {
            if(e) {
                console.log(e);
            }
        }));
    });
});

//监控文件变化
gulp.task('watchdiff', function() {
    // process.stdout()
    gulp.watch(['node/**','htdocs/**']).on('change', function(event) {
        // console.log(event);
        gulp.src(event.path).pipe(uploadProcess.uploadProcessDiff(function(e,d) {
            if(e) {
                console.log(e);
            }
            else {
                console.log(d);
            }
        }))
    });
});

gulp.task('tfs', function() {
    return gulp.src('htdocs/img/*').pipe(gulpDebug()).pipe(uploadProcess.uploadTfsImg(function(e, d) {
        console.log(e)
        console.log(d)
    })).pipe(gulp.dest('htdocs/test/'));
});

gulp.task('php', function() {
    var one = 'beep boop';
    var other = 'beep boob blah';

    
    var test1 = fs.readFileSync('htdocs/css/d2c1.css', 'utf8');
    var test2 = fs.readFileSync('htdocs/css/d2c2.css', 'utf8');
    var diff = jsdiff.diffLines(test1, test2, {ignoreWhitespace: true, newlineIsToken: true});
    console.log(diff);
 
    diff.forEach(function(part){
        // console.log(part.value)
    //   // green for additions, red for deletions 
    //   // grey for common parts 
    //   var color = part.added ? 'green' :
    //     part.removed ? 'red' : 'grey';
    //     process.stderr.write(color)
    //     process.stderr.write(part.value['red'])
    //     // process.stderr.write(part.value[color]);
    });


    // gulp.src('htdoc/css/d2c.css').pipe(gulpPrompt.confirm())
    // .pipe(gulp.dest('dest'));
    // console.error('%cthis is a test', 'font-color:red');
    // var lineOld = [];
    // lineReader.eachLine('htdocs/css/d2c.css', function(line, last) {
    //     // console.log(line);
    //     lineOld.push(line)
    //     if(last) {
    //         console.log(1)
    //         console.log(lineOld)
    //     }
    // });
    // console.log(lineOld);
})