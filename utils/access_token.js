/**
 * Created by dell on 2017/10/6.
 */
const config = require('../config/config.json').config;
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const request = require('request');
const getAccessToken = function (config) {
    let queryParams = {
        'grant_type': 'client_credential',
        'appid': config.appId,
        'secret': config.appsecret
    };
    let wxGetAccessTokenBaseUrl = 'https://api.weixin.qq.com/cgi-bin/token?'+ qs.stringify(queryParams);
    let options = {
        method: 'GET',
        url: wxGetAccessTokenBaseUrl
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (res) {
                //console.log('1',body);
                resolve(JSON.parse(body));
            } else {
                console.log('err',err);
                reject(err);
            }
        });
    })
};
const getJsTicket = function(config){
    return new Promise((resolve, reject) => {
        getAccessToken(config).then(res => {
            let token = res['access_token'];
            fs.writeFile(path.join('./tokens',config.city,'token.txt'), token, function (err) {
                //console.log(err);
            });
            let reqUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ token +'&type=jsapi'
            let options = {
                method: 'get',
                url: reqUrl
            }

            request(options, function (err, res, body) {
                if (res) {
                    let bodys = JSON.parse(body) ;    // 解析微信服务器返回的
                    let ticket = bodys.ticket   ;     // 获取 ticket
                    let expires = bodys.expires_in  ; // 获取过期时间
                    resolve(ticket)
                } else {
                    reject(err)
                }
            })

        })

    })

}
const saveToken = function (config) {
    getJsTicket(config).then(data => {
        let ticket = data;
        fs.writeFile(path.join('./tokens',config.city,'JsTicket.txt'), ticket, function (err) {
            console.log(err);
        });
    })
};

exports.refreshToken = function () {
    config.forEach(function(v,i,arr){
        saveToken(v);
        setInterval(function () {
            saveToken(v);
        }, 7000*1000);
    });
    //saveToken();
    //setInterval(function () {
    //    saveToken();
    //}, 7000*1000);
};
