/**
 * Created by dell on 2017/10/5.
 */
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router.js');
const app = express();
const getToken = require('./access_token.js');
const createMeau = require('./createMeau.js');
const ueditor = require('ueditor');
const path = require('path');
getToken.refreshToken();
setTimeout(function(){
    createMeau.createMenu(); 
},1000);
app.use('/public',express.static('public'));
app.use(express.static('own'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
app.use("/ueditor/ue", ueditor(path.join(__dirname, '../public'), function(req, res, next) {
    var imgDir = '/images/ueditor/';
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/public'+ imgDir;
        console.log('dir_url',dir_url);
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/public/js/libs/ueditor/ueditor.config.json');
    }
}));
exports.startWebServer = function(){
    app.listen(80,()=>{
        console.log('running...');
    });
}