var http            = require('http');
var fs              = require('fs');
var lineReader      = require('line-reader');
var jsdiff          = require('diff');

var appHander = {
}


//上传项目文件
appHander.uploadProjFileDiff = function(req, res) {
    //同步本地地址来判断上传到htdocs还是node目录下
    var localPath = req.body.path;

    //过滤特定类型的文件
    if(/\.(zip|sh)$/.test(localPath)) {
        res.send(JSON.stringify({
            'code'      : -1,
            'file'      : 'forbidden file'
        }));
    }

    //目标路径
    var destPath = '';
    if(localPath.indexOf('d2c/node/') != -1) {
        //node目录的代码
        localPath = localPath.substr(localPath.indexOf('node/')+5, localPath.length-1);
        destPath = '/data/website/d2cnodeweb/' + localPath
    }
    else {
        destPath = '/data/website/qqtalkd2cweb/htdocs/' + localPath.substr(localPath.indexOf('htdocs/')+7, localPath.length-1);
    }

    //上传的临时文件地址
    var tmpFilePath = req.file.path;
    var tmpFileAr   = [];
    var destFileAr  = [];
    var diffs       = [];
    console.log(localPath);

    var newFileContents = fs.readFileSync(tmpFilePath, 'utf8');
    var oldFileContents = fs.readFileSync(destPath, 'utf8');
    var diff = jsdiff.diffLines(newFileContents, oldFileContents, {newlineIsToken: true});
    //再对added和removed进行对比
    diff.forEach(function(part) {
        if(part.added) {
            diffs.push('- ' + part.value) 
        }
        else if(part.removed) {
            diffs.push('+ ' + part.value) 
        }
    })

    res.send(JSON.stringify({
        'code'      : 0,
        'file'      : localPath,
        'diffs'     : diffs
    }));
}

//上传项目文件
appHander.uploadProjFile = function(req, res) {
    //同步本地地址来判断上传到htdocs还是node目录下
    var localPath = req.body.path;

    //过滤特定类型的文件
    if(/\.(zip|sh)$/.test(localPath)) {
        res.send(JSON.stringify({
            'code'      : -1,
            'file'      : 'forbidden file'
        }));
    }

    //目标路径
    var destPath = '';
    if(localPath.indexOf('d2c/node/') != -1) {
        //node目录的代码
        localPath = localPath.substr(localPath.indexOf('node/')+5, localPath.length-1);
        destPath = '/data/website/d2cnodeweb/' + localPath
    }
    else {
        destPath = '/data/website/qqtalkd2cweb/htdocs/' + localPath.substr(localPath.indexOf('htdocs/')+7, localPath.length-1);
    }

    //上传的临时文件地址
    var tmpFilePath = req.file.path;

    fs.readFile(tmpFilePath, function(err, data) {
        fs.writeFile(destPath, data, function(err) {
            res.send(JSON.stringify({
                'code'      : 0,
                'file'      : localPath
            }));
        });
    });
}

exports.appHander = appHander;