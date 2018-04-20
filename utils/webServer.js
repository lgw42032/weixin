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
        var file_url = imgDir;//Ĭ��ͼƬ�ϴ���ַ
        /*�����ϴ���ʽ�ĵ�ַ*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //����
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //��Ƶ
        }
        res.ue_up(file_url); //��ֻҪ����Ҫ����ĵ�ַ �������������ueditor����
        res.setHeader('Content-Type', 'text/html');
    }
    //  �ͻ��˷���ͼƬ�б�����
    else if (req.query.action === 'listimage') {
        var dir_url = '/public'+ imgDir;
        console.log('dir_url',dir_url);
        res.ue_list(dir_url); // �ͻ��˻��г� dir_url Ŀ¼�µ�����ͼƬ
    }
    // �ͻ��˷�����������
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