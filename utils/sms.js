/**
 * Created by Yun heng on 2016-05-24.
 */
var smsUrl = "https://dx.ipyy.net/";
var account = "AE00038";
var password = "AE0003830";
var http = require('http');
var https = require('https');
var qs = require('querystring');
//var appLog = require('./appLog');
exports.sendMsg = function(data,cb){
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
    var content = qs.stringify(postData);
    var chunks = [];
    var size = 0;
    var options = {
        host: "dx.ipyy.net",
        port:443,
        path: '/smsJson.aspx',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            chunks.push(chunk);
            size += chunk.length;
        });
        res.on('end', function () {
            var feedbackMsg = "";
            if(chunks.length > 1){
                for (var i in chunks) {
                    feedbackMsg += chunks[i];
                    //feedback = feedback + chunk[i];
                }
            }else{
                feedbackMsg = chunks[0];
            }
            //appLog.logInfo(feedbackMsg);
            try{
                feedbackMsg = JSON.parse(feedbackMsg);
                cb(null,feedbackMsg)

            }catch (e){
                console.log('parse err ',feedbackMsg);
                cb(e)
            }


        });

    });
    req.on('error', function (e) {
        console.log('errr req',e)
        cb(e)

    });
    req.write(content);
    req.end();

};
