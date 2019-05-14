/**
 * Created by Yun heng on 2016-05-24.
 */
var smsUrl = "https://dx.ipyy.net/";
var account = "AE00038";
var password = "AE0003830";
var http = require('http');
var https = require('https');
var qs = require('querystring');
var request = require('request');
//var appLog = require('./appLog');
exports.sendMsg = function(data,cb){
    return new Promise(function (resolve, reject){
    data.messageContent =  "【急救中心】" + data.messageContent;
    console.log('send msg before');
    var postData = {
        userId:null,
        account:account,
        password:password,
        mobile:data.phoneList,
        content:data.messageContent,
        sendTime:null,
        action:"send",
        extno:null
    };
    var options = {

        url:'http://dx.ipyy.net/smsJson.aspx',
        method: 'POST',
        json:true,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body:qs.stringify(postData)

    };
    request(options, function optionalCallback(err, httpResponse, body) {
        if (err) {
            console.log('error',err)
            return reject(err)
        }else{
            if(httpResponse.statusCode !=200){
                return reject('短信服务出错')
            }
            resolve(body)
        }
    });
    });
};
