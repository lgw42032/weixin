//var async = require('async');
var config = require('../config.json');
var shortid =  require('shortid');
var moment = require('moment');
var request = require('request');
var co = require('co');
var defineData = {};
var db = require('./db');
var fs = require('fs');
var http = require('http');
var appLog = require('./appLog');

exports.getTime = function(time){
    if(this.isEmpty(time)){
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }else{
        return moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss');
    }

};

exports.getDateString = function(d){
    function pad(n){return n<10 ? '0'+n : n}
    return d.getFullYear()+ '' + pad(d.getMonth()+1) +'' + pad(d.getDate()) +''+ pad(d.getHours()) +'' + pad(d.getMinutes())+'' + pad(d.getSeconds())+''
};

/*取某年某月的天数*/
exports.getDays = function(year, month){
    month = parseInt(month, 10);
    var d = new Date(year, month , 0);
    return d.getDate();
}

exports.getUid = function(){
    return  shortid.generate();
}
exports.getConfig = function(){
    return config;
}
exports.dateFormat = function (date, format) {
    if (format === undefined) {
        format = date;
        date = new Date();
    }
    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}
exports.formatSecond = function(second){
    var formatRes = "0秒";
    if(second){
        second = parseInt(second, 10);
        var days = Math.floor(second / (24 * 60 * 60));
        second = second % (24 * 60 * 60);
        var hours = Math.floor(second / (60 * 60));
        second = second % (60 * 60);
        var minutes = Math.floor(second / 60);
        second = second % 60;
        if(days > 0){
            formatRes = days + "天" + hours + "时" + minutes + "分" + second + "秒";
        }else if(hours > 0){
            formatRes = hours + "时" + minutes + "分" + second + "秒";
        }else if(minutes > 0){
            formatRes = minutes + "分" + second + "秒";
        }else{
            formatRes = second + "秒";
        }
    }

    return formatRes;
}
exports.checkObject = function (obj) {
    if (typeof obj == 'undefined') {
        return false;
    }
    return true;
}
exports.isEquals = function (str1, str2) {
    if (str1 == str2) {
        return true;
    }
    return false;
}
exports.isEmpty = function (obj) {
    if (typeof obj == "string") {
        if (obj == "") {
            return true;
        }
    }
    if (typeof obj == 'undefined' || obj == null || obj === undefined) {
        return true;
    }
    return false;
}
exports.transEmptyToNull = function (obj){
    if (typeof obj == "string") {
        if (obj == "") {
            return null;
        }
    }
    if (typeof obj == 'undefined' || obj == null || obj === undefined) {
        return null;
    }
    return obj;
}
exports.isExists = function (obj) {
    if (typeof obj == 'undefined' || obj === undefined) {
        return false;
    } else {
        return true;
    }

}
exports.notExists = function (obj) {
    if (typeof obj == 'undefined' || obj === undefined) {
        return true;
    } else {
        return false;
    }
}
exports.diffDate = function (dateStart, dateEnd) {
    return (dateEnd.getTime() - dateStart.getTime()) / (24 * 60 * 60 * 1000);
}
exports.validateEmailFormat = function (email) {
    var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (reg.test(email)) {
        return true
    } else {
        return false;
    }
};
exports.getValidateCode = function () {
    var num = "";
    for (var i = 0; i < 4; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}
exports.getRandomString = function () {
    require('crypto').randomBytes(16, function (ex, buf) {
        var token = buf.toString('hex');
        console.log(token);
    });
}

exports.getMd5 = function (data) {
    data = data + "";
    var crypto = require('crypto');
    var content = 'password';
    var md5 = crypto.createHash('md5');
    md5.update(data);
    var d = md5.digest('hex');  //MD5值是5f4dcc3b5aa765d61d8327deb882cf99
    return d;
};
exports.echoError = function (res, msg, data) {
    appLog.logError( msg + " : " + data);
    res.json({
        success: false,
        msg: msg,
        data: data
    });
}
exports.echoSuccess = function (res, msg, data) {

    res.json({
        success: true,
        msg: msg,
        data: data
    });
};

exports.inArray = function (item, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (item == arr[i]) {
            return true;
        }
    }
    return false;
};

/* 把对象中的数字转换为字符串类型*/
exports.parseObjectToString = function (data) {
    for (var i in data) {
        if (typeof  data[i] == 'number') {
            data[i] = data[i] + "";
        }
    }
    return data;
};
exports.parseArrayToString = function (data) {
    for (var i in data) {
        for (var j in data[i]) {
            if (typeof  data[i][j] == 'number') {
                data[i][j] = data[i][j] + "";
            }
        }
    }

    return data;
};
exports.unpack = function (buf) {
    var data = buf.toString();
    console.log(data);
    if (data.length == 0)return;
    var recv_list = [];
    try {
        recv_list.push(JSON.parse(data));
    } catch (ex) {

        var flag = {b: "", e: ""};
        var flag_count = {b: 0, e: 0};
        var pos = 0;
        var ignore = 0;

        for (var i = 0; i < data.length; i++) {
            //忽略两个引号中间的"{}"和"[]"
            data[i] == "\"" && (ignore = 1 - ignore);
            if (ignore)continue;

            //没有找到json标记，继续
            if (flag.b == "" && "{[".indexOf(data[i]) == -1) continue;

            if (flag.b == "") {
                flag = data[i] == "{" ? {b: "{", e: "}"} : {b: "[", e: "]"};
                pos = i;
            }
            if (flag.b == data[i])flag_count.b++;
            if (flag.e == data[i])flag_count.e++;
            if (flag_count.b == flag_count.e) {
                var pkg = data.substring(pos, i + 1);
                recv_list.push(JSON.parse(pkg));
                flag.b = "";
                flag.e = "";
            }
        }
    }

    if (recv_list.length > 1) {
        for (var i = 1; i < recv_list.length; i++) {
            if (JSON.stringify(recv_list[i]) == JSON.stringify(recv_list[0])) {
                recv_list.splice(i, 1)
            }
        }
    }

    return recv_list;
}
exports.getSubString = function (obj, start, end) {
    if (typeof obj != 'string') {
        obj = obj + "";
    }
    return obj.substr(start, end);
};
exports.GetDateStr = function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d + " 00:00:00";
};

exports.getCurrentTime = function () {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    var d = curr_time.getDate();
    var hh = curr_time.getHours();
    var mm = curr_time.getMinutes();
    var ss = curr_time.getSeconds();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
        + ' ' + (hh < 10 ? ('0' + hh) : hh) + ':'
        + (mm < 10 ? ('0' + mm) : mm) + ':' + (ss < 10 ? ('0' + ss) : ss);
};

exports.calculateRate = function (ratio) {
    return (Math.round(ratio * 10000) / 100.00 + "%");// 小数点后两位百分比
};
exports.getApiUrl = function(){

    return "https://"+config.centerHost+':'+config.centerPort;
};
exports.sendCenter = function(data){
    console.log('sendCenterData',data.data);
    if(!data.data){
        data.data = null
    }
    var self = this;
    return new Promise(function (resolve, reject){
        appLog.logInfo("sendCenter"+ data.data);
        co(function* () {
            data.url = self.getApiUrl() + data.url;
            if(data.method == 'get' || data.method == 'GET'){
                request({method:data.method,uri:data.url,json:true,qs:data.data}, function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        console.log('error',err);

                        return reject(err)
                    }else{
                        appLog.logInfo("sendCenterSuccess"+ data.data);
                        console.log('body',body)
                        resolve(body)
                    }
                });
            }else{
                request({method:data.method,uri:data.url,json:true,body:data.data,  strictSSL: false}, function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        console.log('error',err)
                        return reject(err)
                    }else{
                        resolve(body)
                    }
                });
            }

        }).catch(function(e){
            console.log('e',e)
            reject(e)

        })
    });

};
exports.isJson = function(obj){
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
};
exports.sha1=function(str) {
    const crypto = require('crypto');
    let shasum = crypto.createHash("sha1")
    shasum.update(str)
    str = shasum.digest("hex")
    return str
}

/**
 * 生成签名的时间戳
 * @return {字符串}
 */
exports.createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + ''
}

/**
 * 生成签名的随机串
 * @return {字符串}
 */
exports.createNonceStr =function  () {
    return Math.random().toString(36).substr(2, 15)
}

/**
 * 对参数对象进行字典排序
 * @param  {对象} args 签名所需参数对象
 * @return {字符串}    排序后生成字符串
 */
exports.raw = function (args) {
    var keys = Object.keys(args)
    keys = keys.sort()
    var newArgs = {}
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key]
    })

    var string = ''
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
}

/**
 * @synopsis 签名算法
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns {对象} 返回微信jssdk所需参数对象
 */
exports.sign = function(jsapi_ticket, url) {
    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: this.createNonceStr(),
        timestamp:this.createTimestamp(),
        url: url
    }
    var string = this.raw(ret)
    ret.signature = this.sha1(string)
    ret.appId =  config.config[0].appid
    return ret
}

/**
 * 返回微信jssdk 所需参数对象
 * @param  {字符串} url 当前访问URL
 * @return {promise}     返回promise类 val为对象
 */
