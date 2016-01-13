var http    = require('http');
var through = require('through2');
var _       = require('underscore');
var path    = require('path');
var inquirer = require("inquirer");


var basePath = "../../";
var optionsUpload = {
    port : '80',
    method : 'POST',
    path : '/d2c_cgi/upload_proj_file',
    host : 'd2c.qq.com',
    headers : {},
    file : false    
};

var tfsImgOption = {
    port : '80',
    method : 'POST',
    path : '/s/qqgame_cms/save_pic_global/',
    host : 't.open.oa.com',
    headers : {},
    file : false   
}

//对比文件
var optionsDiff = {
    port : '80',
    method : 'POST',
    path : '/d2c_cgi/upload_proj_file_diff',
    host : 'd2c.qq.com',
    headers : {},
    file : false    
};

//对比上传临时变量
var gTmpOpts,
    gTmpFile,
    gTmpOptions,
    gTmpCallback;
//标识是否对比上传
var gUploadDiff = false;

var upload = function() {

}

var uploadProcess = function(opts, cb) {
    return through.obj(function(file, enc, callback) {
        gUploadDiff = false;
        sendFile(opts, file, optionsUpload, callback);
    });
}

var uploadTfsImg =function(opts, enc, cb) {
    return through.obj(function(file, enc, cb) {
        console.log(file);
        gUploadDiff = false;
        sendFile(opts, file, tfsImgOption, cb);
        //循环pipe过来的文件
        cb(null, file);
    }, function(cb) {
        console.log('it is all');
        cb();
    });
}

var uploadProcessDiff = function(opts, cb) {
    return through.obj(function(file, enc, callback) {
        gTmpOpts        = opts;
        gTmpFile        = file;
        gTmpOptions     = optionsDiff;
        gTmpCallback    = callback;
        gUploadDiff     = true;
        sendFile(opts, file, optionsDiff, callback);
    });
}

upload.uploadProcess            = uploadProcess;
upload.uploadTfsImg             = uploadTfsImg;
upload.uploadProcessDiff        = uploadProcessDiff;

function sendFile(opts, file, options, callback) {
    options.file = file.path;

    if(!callback && _.isFunction(opts)) {
        callback = opts;
        opts = { headers : {}};
    }

    opts = opts || {};
    opts.headers = opts.headers || {};

    var boundary = Math.random();
    var req = null;
    var data = [];
    var contentLength = 0;
    var defaults = {
        headers : {
            'Content-Type' : 'multipart/form-data; boundary=' + boundary,
            'x-file-name'  : getFileName(options.file)
        }
    }

    _.extend(opts.headers, defaults.headers);
    _.extend(options, opts);

    options.mime = 'application/octet-stream' || options.mime;
    //构造form表单
    data.push(new Buffer(encodeFieldPart(boundary, 'path', path.relative(basePath,file.path).replace(/\\/g,'/')), 'ascii'));
    data.push(new Buffer(encodeFieldPart(boundary, 'verify', 'qt'), 'ascii'));
    data.push(new Buffer(encodeFieldPart(boundary, 'username', process.env.USERNAME||'unknow'), 'ascii'));
    data.push(new Buffer(encodeFilePart(boundary, options.mime, 'upfile', getFileName(options.file)), 'ascii'))
    data.push(file.contents);
    data.push(new Buffer("\r\n--" + boundary + "--"), 'ascii');
    
    for(var i = 0, len = data.length; i < len; i++){
        contentLength+=data[i].length;
    }

    options.headers['Content-Length'] = contentLength;

    //往机器上面发请求
    req = getRequestObj(options, callback);
    for(var i = 0, len = data.length; i < len; i++){
        req.write(data[i]);
    }
    req.end();
 }

function encodeFieldPart(boundary, name, value) {
    var r = '--' + boundary + '\r\n';
    r += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
    r += value + "\r\n";
    return r;
}

function encodeFilePart(boundary, type, name, filename) {
    var r = '--' + boundary + '\r\n';
    r += "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n";
    r += "Content-Type: " + type + "\r\n\r\n";
    return r;
}


//从路径得到文件名
function getFileName(path) {
    return path.substr(path.lastIndexOf('/')+1, path.length);
}

function getRequestObj(options, callback) {
    var req = http.request(options, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        // console.log('return: ' + chunk);
        chunk = JSON.parse(chunk);
        if(gUploadDiff) {            
            if(chunk.diffs.length > 0) {
                //文件有变动
                var hint = '\n更新内容\n';
                //构造提示
                for(var i=0,l=chunk.diffs.length;i<l;i++) {
                    hint += chunk.diffs[i] + '\n';
                }
                //进行提示
                inquirer.prompt([{'type':'confirm', 'message': hint + '\n是否确认上传？', 'name':'confirm_upload'}], function(answer) {
                    gUploadDiff = false;
                    //如果确认，进行实际文件上传
                    if(answer.confirm_upload) {
                        sendFile(gTmpOpts, gTmpFile, optionsUpload, gTmpCallback);
                    }
                });
            }
        }
        else {
            process.stdout.write('上传成功: ' + chunk.file + '\n');
        }
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    return req;
}

module.exports = upload;