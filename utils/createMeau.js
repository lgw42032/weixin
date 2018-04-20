/**
 * Created by dell on 2017/10/6.
 */
const fs = require('fs');
const path = require('path');
const request = require('request');
const config = require('../config/config.json').config;
const host = require('../config/config.json').host;
function delMeau(token){
    return new Promise(function(resolve,reject){
        var url = 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=' + token;
        request(url,function(err,response,body){
            
           
             if (!err && response.statusCode == 200) {
                 resolve();
            }else{
                throw new Error('delete menu failed!');
            }
        })
    });
}
function createMeau(config){


    var microAidUrl =encodeURIComponent( host +"/microAid"+"?city="+ config.city);
    var realMicroAidUrl =  "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ config.appId + "&redirect_uri="+ microAidUrl +"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
    var microNetUrl = encodeURIComponent(host +"/microNet"+"?city="+ config.city);
    var realMicroNetUrl =  "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ config.appId + "&redirect_uri="+ microNetUrl +"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
    var personalCenterUrl = encodeURIComponent(host +"/personalCenter"+"?city="+ config.city);
    var realPersonalCenterUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ config.appId + "&redirect_uri="+ personalCenterUrl +"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";

//常用type为view和click,分别为点击事件和链接
    var menus = {
        "button": [
            {
                "type":"view",
                "name":"微网站",
                "url":realMicroNetUrl
            },  {
                "type":"view",
                "name":"智慧急救",
                "url":realMicroAidUrl
            },  {
                "type":"view",
                "name":"我的",
                "url":realPersonalCenterUrl
            }]
    };
    return menus;
}
exports.createMenu = function() {
    config.forEach(function(v,i,arr){
	console.log('createMenu')
        var token = fs.readFileSync(path.join('./tokens',v.city,'token.txt').toString());
        delMeau(token).then(function(){
            let options = {
                url: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + token,
                form: JSON.stringify(createMeau(v)),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            request.post(options, function (err, res, body) {
                if (err) {
                    console.log(err)
                }else {
                    console.log(body);
                }
            })
        },function(err){
            console.log(err)
        })

    });
}

