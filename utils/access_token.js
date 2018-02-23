/**
 * Created by dell on 2017/10/6.
 */
const config = require('../config.json').config;
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
const saveToken = function (config) {
    getAccessToken(config).then(res => {
        let token = res['access_token'];
        fs.writeFile(path.join('./tokens',config.city,'token.txt'), token, function (err) {
            //console.log(err);
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
