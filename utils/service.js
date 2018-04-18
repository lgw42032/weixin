const qs = require('querystring');
const path = require('path');
const fs = require('fs');
//const config = require('./config.json').config;
const request = require('request');
const crypto = require('crypto');
const co = require('co');
const tools = require('./tools');
const db = require('./db');
const sms = require('./sms');
const moment = require('moment');
const config = require('../config.json').config;
const sha1 = require('sha1');
var i=0;
//xml解析模块
const XMLJS = require('xml2js');
const token = require('../config.json').token;
//解析，将xml解析为json
var parser = new XMLJS.Parser();
//重组，将json重组为xml
var builder = new XMLJS.Builder({'cdata ': true});
var i=0;

function getToken(code,config) {
    let reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
    let params = {
        appid: config.appId,
        secret: config.appsecret,
        code: code,
        grant_type: 'authorization_code'
    };

    let options = {
        method: 'get',
        url: reqUrl+qs.stringify(params)
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (res) {
                resolve(body);
            } else {
               console.log('err',err);
                reject(err);
            }
        })
    })
}
function getUserInfo(AccessToken, openId) {
    let reqUrl = 'https://api.weixin.qq.com/sns/userinfo?';
    let params = {
        access_token: AccessToken,
        openid: openId,
        lang: 'zh_CN'
    };

    let options = {
        method: 'get',
        url: reqUrl+qs.stringify(params)
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (res) {
                resolve(body);
            } else {
                console.log('err',err);
                reject(err);
            }
        });
    })
}
var EventFunction = {
    //关注
    subscribe: function(result, req, res) {
        var xml  = {xml: {
            ToUserName: result.FromUserName,
            FromUserName: result.ToUserName,
            CreateTime: + new Date(),
            MsgType: 'text',
            Content: '感谢您的关注'
        }};
        xml = builder.buildObject(xml);//发送给微信
        res.send(xml);
//存入openid 通过微信的接口获取用户的信息同时存入数据库。
//        res.redirect('wx_login');
    },
    //注销
    unsubscribe: function(openid, req, res) {
//删除对应id
    },
    //打开某个网页
    VIEW: function() {
//根据需求，处理不同的业务
    },
//自动回复
    responseNews: function(body, res) {
//组装微信需要的json
        var xml  = {xml: {
            ToUserName: body.FromUserName,
            FromUserName: body.ToUserName,
            CreateTime: + new Date(),
            MsgType: 'text',
            Content: '编辑@+您想说的话，我们可以收到'
        }};
        var reciviMessage = body.Content[0];
        if(/^\@.*/.test(reciviMessage)) {
            xml.xml.Content = '已经收到您的建议，会及时处理！'
        }//将json转为xml
        xml = builder.buildObject(xml);//发送给微信
        res.send(xml);
    }
};
//js 安全域名校验
exports.join =(req,res)=>{
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    //var info={
    //    signature:signature,
    //    timestamp:timestamp,
    //    nonce:nonce
    //}
    //console.log('info',info);
    //fs.writeFile(path.join('./accountInfo.json'),  JSON.stringify(info), function (err) {
    //    console.log('writeAccout',err);
    //});

    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(token,timestamp,nonce);
    array.sort();
    var str = array.toString().replace(/,/g,"");

    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(str,'utf-8').digest("hex");

    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(code===signature){
        res.send(echostr);
    }else{
        res.send("error");
        console.log("授权失败!");
    }
};
exports.interaction = (req,res) => {
    //获取参数
        var chunk='';
        req.on("data",function(data){
            chunk+=data;
        });
        req.on("end", function(data) {
            //将xml解析
                parser.parseString(chunk.toString(), function(err, result) {
                    var body = result.xml;
                    var messageType = body.MsgType[0];
                    //用户点击菜单响应事件
                    if(messageType === 'event') {
                        var eventName = body.Event[0];
                        (EventFunction[eventName]||function(){})(body, req, res);
                        //自动回复消息
                    }else if(messageType === 'text') {
                        EventFunction.responseNews(body, res);
                    }
                });
        });
};

//获取token
exports.getToken = (req,res)=>{
    let token = fs.readFileSync(path.join(__dirname + '/../tokens/411400/token.txt').toString());
    tools.echoSuccess(res,"success",token);
}

//获取jssdk
exports.getJssdk = (req,res) => {
    let clientUrl = req.body.url
    if(tools.isEmpty(clientUrl)){
        return tools.echoError(res, req.url + "no url");
    }
    let jsTicket = fs.readFileSync(path.join(__dirname + '/../tokens/411400/JsTicket.txt').toString());
    let ret =tools.sign(jsTicket,clientUrl);

    res.json(ret);
};
/*短信验证码：*/
exports.sendMessage =(req,res)=>{
    let queryParams = req.body;
    var phone = queryParams.mobilePhone;
    var verificationCode = "";
    for(var i=0;i<4;i++){
        verificationCode += Math.floor(Math.random()*10)
    }
    console.log(verificationCode);
    var smsContent ="您的微急救服务验证码为：" + verificationCode + ",请勿向他人泄露";
    let time = tools.getCurrentTime();
    co(function* () {
        var sql = 'INSERT into `sms` set phone=?, verificationCode=?,sendTime = ?';
        var params = [phone,verificationCode,time];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
    var params = {
        phoneList:phone,
        messageContent:smsContent
    };
    sms.sendMsg(params,function(err,data){
        if (err) {
            console.log(err,data);
        }
        console.log('发送时间',moment().format('YYYY-MM-DD HH:mm:ss'))
    })
};

/*公众号后台管理*/
//增加中心
exports.addCenter = (req,res) => {
    let queryParams = req.body;
    console.log(queryParams);
    co(function* () {
        var sql = 'INSERT into `centerinfo` set cityCode=?, centerName=?,password = ?';
        var params = [queryParams.cityCode,queryParams.centerName,queryParams.password];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//中心登陆
exports.login = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sqlItem = {
            sql:"select cityCode,password,centerName,centerDesc,centerAddress,linkTele,centerImgUrl,lng,lat from centerinfo where cityCode =? ",
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log('queryRes:',queryRes);
        if(queryRes.length == 0){
            return tools.echoError(res,"fail","用户:" + queryParams.cityCode + "不存在");
        }
        var centerItem = queryRes[0];
        if(centerItem.password != queryParams.password){
            return  tools.echoError(res,"error", queryParams.cityCode + "密码错误");
        }
        var centerInfo = {
            cityCode: centerItem.cityCode,
            centerName:centerItem.centerName,
            centerDesc:centerItem.centerDesc,
            centerAddress:centerItem.centerAddress,
            linkTele:centerItem.linkTele,
            centerImgUrl:centerItem.centerImgUrl,
            lng:centerItem.lng,
            lat:centerItem.lat
        };

        res.cookie('centerInfo', JSON.stringify(centerInfo));//登录信息存入session
        tools.echoSuccess(res, "success", centerItem);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//编辑关于我们
exports.editAboutUs = (req,res) => {
    let queryParams = req.body;
    console.log(queryParams);
    co(function* () {
        var sql = 'update centerinfo SET centerDesc = ? where cityCode = ? limit 1';
        var params = [queryParams.centerDesc||null,queryParams.cityCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        if(queryRes.affectedRows == 1){
            tools.echoSuccess(res,"success",queryRes);
        }else{
            tools.echoError(res,"error", '参数错误');
        }
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//编辑联系方式和中心地址
exports.editContactUs = (req,res) => {
    let queryParams = req.body;
    console.log(queryParams);
    co(function* () {
        var sql = 'update centerinfo SET centerName = ?,centerAddress = ?,linkTele=? ,lng=?, lat=? where cityCode = ? limit 1';
        var params = [queryParams.centerName||null,queryParams.centerAddress||null,queryParams.linkTele||null,queryParams.lng||null,queryParams.lat||null,queryParams.cityCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        if(queryRes.affectedRows == 1){
            tools.echoSuccess(res,"success",queryRes);
        }else{
            tools.echoError(res,"error", '参数错误');
        }
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//编辑轮播图
exports.editCenterImgUrl = (req,res) => {
    let queryParams = req.body;
    console.log(queryParams);
    co(function* () {
        var sql = 'update centerinfo SET centerImgUrl=? where cityCode = ? limit 1';
        var params = [queryParams.centerImgUrl||null,queryParams.cityCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        if(queryRes.affectedRows == 1){
            tools.echoSuccess(res,"success",queryRes);
        }else{
            tools.echoError(res,"error", '参数错误');
        }
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//获取网络医院
exports.getHospitalNet = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sqlItem = {
            sql:"select stationCode,stationName,lng,lat from station where cityCode=?",
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log('queryRes:',queryRes);
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//增加医院
exports.addHospital = (req,res) => {
    let queryParams = req.body;
    var uid ;
    if(!queryParams.stationCode){
        uid =  tools.getUid();
    }else{
        uid = queryParams.stationCode;
        console.log(uid);
    }
    co(function* () {
        var sql = 'replace into station(cityCode,stationCode,stationName,lng,lat) values(?,?,?,?,?)';
        var params = [queryParams.cityCode,uid,queryParams.stationName,queryParams.lng,queryParams.lat];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除医院
exports.delHospital = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        //var sql = 'replace into station(cityCode,stationCode,stationName,lng,lat) values(?,?,?,?,?)';
        var sql = 'delete from station where cityCode=? and stationCode=?';
        var params = [queryParams.cityCode,queryParams.stationCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//获取车辆
exports.getVehicles = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sqlItem = {
            sql:"select vehicleCode,plateNumber,stationName from vehicle where cityCode=?",
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log('queryRes:',queryRes);
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//增加车辆
exports.addVehicle = (req,res) => {
    let queryParams = req.body;
    var uid ;
    if(!queryParams.vehicleCode){
        uid =  tools.getUid();
    }else{
        uid = queryParams.vehicleCode;
        console.log(uid);
    }
    co(function* () {
        var sql = 'replace into vehicle(cityCode,vehicleCode,plateNumber,stationName) values(?,?,?,?)';
        var params = [queryParams.cityCode,uid,queryParams.plateNumber,queryParams.stationName];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除车辆
exports.delVehicle = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        //var sql = 'replace into station(cityCode,stationCode,stationName,lng,lat) values(?,?,?,?,?)';
        var sql = 'delete from vehicle where cityCode=? and vehicleCode=?';
        var params = [queryParams.cityCode,queryParams.vehicleCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//查询车辆
exports.searchVehicles = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sqlItem = {
            sql:"select vehicleCode,plateNumber,stationName from vehicle where cityCode=? and plateNumber like ?",
            params:[queryParams.cityCode,'%'+queryParams.plateNumber+'%']
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log('queryRes:',queryRes);
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};



//获取养生食疗全部列表
exports.getCenterRegimenDietAllList = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {
        var sqlItem = {
            sql:"select id,title,content from regimenDiet where  flag=0"
        };
        queryRes = yield db.executeSqlItem(sqlItem);
        var sqlItem1 = {
            sql:"select id,title,content from regimenDiet where cityCode=? and flag=1",
            params:[queryParams.cityCode]
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        queryRes.push.apply(queryRes,queryRes1);
        tools.echoSuccess(res, "success", queryRes);

    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//中心获取养生食疗列表
exports.getCenterRegimenDietList = (req,res) =>  {
    let queryParams = req.query;
    if(queryParams.flag==0){
        co(function* () {
            var sqlItem = {
                sql:"select id,title,content from regimenDiet where  flag=0"
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }else{
        co(function* () {

            var sqlItem = {
                sql:"select id,title,content from regimenDiet where cityCode=? and flag=1",
                params:[queryParams.cityCode]
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }

};

//获取养生食疗条目
exports.getCenterRegimenDietItem= (req,res) => {
    let queryParams = req.query;
    co(function* () {
        var sql = 'select id,title,content from regimenDiet where  id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//增加养生食疗条目
exports.addCenterRegimenDietItem = (req,res) => {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into regimenDiet(cityCode,id,title,content,flag) values(?,?,?,?,?)';
        var params = [queryParams.cityCode,queryParams.id||null,queryParams.title,queryParams.content,queryParams.flag];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除养生食疗条目
exports.delCenterRegimenDietItem = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        var sql = 'delete from regimenDiet where id=?  limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};



//获取急救常识分类全部列表
exports.getAidKnowledgeCategoryAllList = (req,res) =>  {
    let queryParams = req.query;
    console.log('haha',queryParams);
    var queryRes;
    co(function* () {
        var sqlItem = {
            sql:"select id,categoryname from aidknowledgecategory where flag= 0"
        };
        queryRes = yield db.executeSqlItem(sqlItem);
        console.log('hahah',queryRes);
        var sqlItem1 = {
            sql:"select id,categoryname from aidknowledgecategory where cityCode=? and flag=1",
            params:[queryParams.cityCode]
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        queryRes.push.apply(queryRes,queryRes1);
        tools.echoSuccess(res, "success", queryRes);

    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//中心获取急救常识分类列表
exports.getAidKnowledgeCategoryList = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    if(queryParams.flag==0){
        co(function* () {
            var sqlItem = {
                sql:"select id,categoryname from aidknowledgecategory where  flag=0",
                params:[queryParams.cityCode]
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);
        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }else{
        co(function* () {
            var sqlItem = {
                sql:"select id,categoryname from aidknowledgecategory where cityCode=? and flag=1",
                params:[queryParams.cityCode]
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }

};

//获取急救常识分类条目
exports.getAidKnowledgeCategoryItem= (req,res) => {
    let queryParams = req.query;
    co(function* () {
        var sql = 'select id,categoryname from aidknowledgecategory where id = ? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//增加急救常识分类条目
exports.addAidKnowledgeCategoryItem = (req,res) => {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into aidknowledgecategory(cityCode,id,categoryname,flag) values(?,?,?,?)';
        var params = [queryParams.cityCode,queryParams.id||null,queryParams.category,queryParams.flag];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除急救常识分类条目
exports.delAidKnowledgeCategoryItem = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        var sql = 'delete from aidknowledgecategory where id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//获取通知列表
exports.getNoticeList = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {

        var sqlItem = {
            sql:"select id,cityCode,title,content from notice where cityCode=?",
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        //queryRes.push.apply(queryRes,queryRes1);
        //var page = queryParams.page;
        //var rows = queryParams.rows || 10;
        //console.log('page',page);
        //console.log('rows',rows);
        //var startIndex = (page - 1) * rows;
        //var endIndex = page * rows <= queryRes.length ? page * rows : queryRes.length;
        //var grid = {"total": queryRes.length, "rows": queryRes.slice(startIndex, endIndex)};
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//添加通知
exports.addNotice = (req,res) =>  {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into notice(cityCode,id,title,content) values(?,?,?,?)';
        var params = [queryParams.cityCode,queryParams.id||null,queryParams.title,queryParams.content];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除通知
exports.delNotice = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        var sql = 'delete from notice where id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//用户提交反馈
exports.addFeedback = (req,res) =>  {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into feedback(openid,id,content) values(?,?,?)';
        var params = [queryParams.openid,queryParams.id||null,queryParams.content];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//后台查看反馈
exports.getFeedback = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {

        var sqlItem = {
            sql:"select n.id,n.openid,u.realName,n.content " +
                 "from notice n left join user u on n.openid = u.openid " +
                "where u.cityCode=?",
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        //queryRes.push.apply(queryRes,queryRes1);
        //var page = queryParams.page;
        //var rows = queryParams.rows || 10;
        //console.log('page',page);
        //console.log('rows',rows);
        //var startIndex = (page - 1) * rows;
        //var endIndex = page * rows <= queryRes.length ? page * rows : queryRes.length;
        //var grid = {"total": queryRes.length, "rows": queryRes.slice(startIndex, endIndex)};
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};



//获取用户列表
exports.getUsersInfo = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {

        var sqlItem = {
            sql:"select  id,openid,cityCode,nickName,headimgurl,realName,sex,age,idNumber,mobilePhone,address,contactPerson1,linkTele1,contactPerson2,linkTele2" +
            "from user where cityCode=? " ,
            params:[queryParams.cityCode]
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        //queryRes.push.apply(queryRes,queryRes1);
        //var page = queryParams.page;
        //var rows = queryParams.rows || 10;
        //console.log('page',page);
        //console.log('rows',rows);
        //var startIndex = (page - 1) * rows;
        //var endIndex = page * rows <= queryRes.length ? page * rows : queryRes.length;
        //var grid = {"total": queryRes.length, "rows": queryRes.slice(startIndex, endIndex)};
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};


//获取急救常识全部列表
exports.getAidKnowledgeAllList = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {
        var sqlItem = {
            sql:"select id,title,img,content,category from aidknowledge where  flag=0"
        };
        queryRes = yield db.executeSqlItem(sqlItem);
        var sqlItem1 = {
            sql:"select id,title,img,content,category from aidknowledge where cityCode=? and flag=1",
            params:[queryParams.cityCode]
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        queryRes.push.apply(queryRes,queryRes1);
        var page = queryParams.page;
        var rows = queryParams.rows || 10;
        console.log('page',page);
        console.log('rows',rows);
        var startIndex = (page - 1) * rows;
        var endIndex = page * rows <= queryRes.length ? page * rows : queryRes.length;
        //var grid = {"total": queryRes.length, "rows": queryRes.slice(startIndex, endIndex)};
        tools.echoSuccess(res, "success", queryRes.slice(startIndex, endIndex));


    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//中心获取急救常识列表
exports.getAidKnowledgeList = (req,res) =>  {
    let queryParams = req.query;
    if(queryParams.flag==0){
        co(function* () {
            var sqlItem = {
                sql:"select id,title,img,content,category from aidknowledge where  flag=0"
            };
            queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }else{
        co(function* () {
            var sqlItem = {
                sql:"select id,title,img,content,category from aidknowledge where cityCode=? and flag=1",
                params:[queryParams.cityCode]
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }

};

//获取急救常识条目
exports.getAidKnowledgeItem= (req,res) => {
    let queryParams = req.query;
    co(function* () {
        var sql = 'select id,title,img,content,category from aidknowledge  where  id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        var page = queryParams.page;
        var rows = queryParams.rows || 10;
        console.log('page',page);
        console.log('rows',rows);
        var startIndex = (page - 1) * rows;
        var endIndex = page * rows <= queryRes.length ? page * rows : queryRes.length;
        //var grid = {"total": queryRes.length, "rows": queryRes.slice(startIndex, endIndex)};
        tools.echoSuccess(res, "success", queryRes.slice(startIndex, endIndex));
        //tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//增加急救常识条目
exports.addAidKnowledgeItem = (req,res) => {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into aidknowledge(cityCode,id,title,img,content,category,flag) values(?,?,?,?,?,?,?)';
        var params = [queryParams.cityCode,queryParams.id||null,queryParams.title,queryParams.img,queryParams.content,queryParams.category,queryParams.flag];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除急救常识条目
exports.delAidKnowledgeItem = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        var sql = 'delete from aidknowledge where id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//根据分类获取急救常识
exports.getAidKnowledgeByCategory = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams)
    co(function* () {
        var sql = "select id,title,img from aidknowledge where cityCode=? and category = ? ";
        var  params = [queryParams.cityCode,queryParams.category];
        var sqlItem = {
            sql : sql,
            params:params
        };
        queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res, "success", queryRes);
    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });






};


//获取急救视频全部列表
exports.getAidVideoAllList = (req,res) =>  {
    let queryParams = req.query;
    console.log(queryParams);
    var queryRes;
    co(function* () {
        var sqlItem = {
            sql:"select id,title,img from aidvideo where  flag=0"
        };
        queryRes = yield db.executeSqlItem(sqlItem);
        var sqlItem1 = {
            sql:"select id,title,img from aidvideo where cityCode=? and flag=1",
            params:[queryParams.cityCode]
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        queryRes.push.apply(queryRes,queryRes1);
        tools.echoSuccess(res, "success", queryRes);

    }).catch(function(err){
        return tools.echoError(res, err.msg, req.url + " " + err.err);
    });
};

//中心获取急救视频列表
exports.getAidVideoList = (req,res) =>  {
    let queryParams = req.query;
    if(queryParams.flag==0){
        co(function* () {
            var sqlItem = {
                sql:"select id,title from aidvideo where  flag=0"
            };
            queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }else{
        co(function* () {
            var sqlItem = {
                sql:"select id,title from aidvideo where cityCode=? and flag=1",
                params:[queryParams.cityCode]
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            tools.echoSuccess(res, "success", queryRes);

        }).catch(function(err){
            return tools.echoError(res, err.msg, req.url + " " + err.err);
        });
    }

};

//获取急救视频条目
exports.getAidVideoItem= (req,res) => {
    let queryParams = req.query;
    co(function* () {
        var sql = 'select id,title,img,videoUrl,videoDetail from aidvideo where  id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//增加急救视频条目
exports.addAidVideoItem = (req,res) => {
    let queryParams = req.body;

    co(function* () {
        var sql = 'replace into aidvideo(cityCode,id,title,img,videoUrl,videoDetail,flag) values(?,?,?,?,?,?,?)';
        var params = [queryParams.cityCode,queryParams.id||null,queryParams.title,queryParams.img,queryParams.videoUrl,queryParams.videoDetail,queryParams.flag];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除急救视频条目
exports.delAidVideoItem = (req,res) => {
    let queryParams = req.body;
    co(function* () {
        var sql = 'delete from aidvideo where id=? limit 1';
        var params = [queryParams.id];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};


//智慧急救
exports.microAid = (req,res) => {
    let params = req.query;
	console.log(params,'params');
    let token='';
    const configs = require('../config.json').config;
    var config;
    configs.forEach(function(v,i,arr){
        if(v.city == params.city ){
            config = v;
            token= fs.readFileSync(path.join('./tokens',v.city,'token.txt').toString());
 getToken(params.code,config).then(function(data){
        let params = JSON.parse(data);
        if(!!params.openid){
            return getUserInfo(params.access_token,params.openid);
        }else{
	    res.redirect('/public/error.html')
	}
    }).then(function(userInfo){
        userInfo = JSON.parse(userInfo);
        if(!!userInfo.openid){
            co(function* () {
                var sql1 = "insert ignore into user(cityCode,openid,nickname,headimgurl)values(?,?,?,?)";
                var params1 = [ config.city,userInfo.openid,userInfo.nickname,userInfo.headimgurl];
                var sqlItem1 = {
                    sql : sql1,
                    params:params1
                };
                var queryRes1 = yield db.executeSqlItem(sqlItem1);
            }).catch(function(err){
                tools.echoError(res, "db error", err);
            });
            res.redirect('/public/microAid.html?openid='+ userInfo.openid+'&city='+ config.city+'&token='+token);
        }else{
	    res.redirect('/public/error.html')
	}
    }).catch(function(err){
	console.log(err)}
);
        }
    });

   
};

//微网站
exports.microNet = (req,res) => {
    let params = req.query;
    const configs = require('../config.json').config;
    var config='';
    let token='';
    configs.forEach(function(v,i,arr){
        if(v.city == params.city ){
            config = v;
            token= fs.readFileSync(path.join('./tokens',v.city,'token.txt').toString());
getToken(params.code,config).then(function(data){
        let params = JSON.parse(data);
        if(!!params.openid){
            return getUserInfo(params.access_token,params.openid);
        }else{
	    res.redirect('/public/error.html')
	}
    }).then(function(userInfo){
        userInfo = JSON.parse(userInfo);
        if(!!userInfo.openid){
            co(function* () {
                var sql1 = "insert ignore into user(cityCode,openid,nickname,headimgurl)values(?,?,?,?)";
                var params1 = [ config.city,userInfo.openid,userInfo.nickname,userInfo.headimgurl];
                var sqlItem1 = {
                    sql : sql1,
                    params:params1
                };
                var queryRes1 = yield db.executeSqlItem(sqlItem1);
            }).catch(function(err){
                tools.echoError(res, "db error", err);
            });
            res.redirect('/public/microNet.html?openid='+ userInfo.openid+'&city='+ config.city+'&token='+token);
        }else{
	    res.redirect('/public/error.html')
	}
    }).catch(function(err){
	console.log(err)}
);;
        }
    });

   
};

//个人中心
exports.personalCenter = (req,res) => {  
    let params = req.query;
 console.log(params,'params');

    let token='';
    const configs = require('../config.json').config;
    var config;
    configs.forEach(function(v,i,arr){
        if(v.city == params.city ){
            config = v;
            token= fs.readFileSync(path.join('./tokens',v.city,'token.txt').toString());
 getToken(params.code,config).then(function(data){
        let params = JSON.parse(data);
        if(!!params.openid){
            return getUserInfo(params.access_token,params.openid);
        }else{
	    res.redirect('/public/error.html')
	}
    }).then(function(userInfo){
        userInfo = JSON.parse(userInfo);
        if(!!userInfo.openid){
            co(function* () {
                var sql1 = "insert ignore into user(cityCode,openid,nickname,headimgurl)values(?,?,?,?)";
                var params1 = [ config.city,userInfo.openid,userInfo.nickname,userInfo.headimgurl];
                var sqlItem1 = {
                    sql : sql1,
                    params:params1
                };
                var queryRes1 = yield db.executeSqlItem(sqlItem1);
            }).catch(function(err){
                tools.echoError(res, "db error", err);
            });
            res.redirect('/public/personalCenter.html?openid='+ userInfo.openid+'&city='+ config.city+'&token='+token);
        }
    }).catch(function(err){
	console.log(err)}
);
        }
    });

    
};

//呼救120
exports.aidCall = (req,res)=>{
    let queryParams = req.body;
    console.log(queryParams);
    let time = tools.getCurrentTime();
    var uid = tools.getDateString(new Date()) + tools.getUid();
    var postData = {};
    console.log(time);
    co(function* () {
        var sql = "insert into event SET callerName=?,callTime=?,lng=?,lat=?,eventAddress=?,helpType=?,helperuid=?,lsh=?";
        var params = [queryParams.callerName,time,queryParams.lng||null,queryParams.lat||null,queryParams.address||null,queryParams.helpType||null,queryParams.helperuid||null,uid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        postData.lng = queryParams.lng;
        postData.lat = queryParams.lat;
        postData.eventAddress = queryParams.address;
        postData.helpType = queryParams.helpType;
        postData.callTime = time;
        postData.lsh = uid;
        postData.helperuid = null;


        var sql1 = 'select openid, realName,sex,age,idNumber,mobilePhone,address,contactPerson1,linkTele1,contactPerson2,linkTele2' +
            ' from user where openid =? limit 1';
        var params1 = [queryParams.callerName];
        var sqlItem1= {
            sql : sql1,
            params:params1
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        //postData.mobilePhone = queryRes1[0].mobilePhone;
        //postData.userInfo = queryRes1[0]
        postData = Object.assign(postData,queryRes1[0]);


        if(queryParams.helpType==0){
            let sql2 = 'select height,weight,bloodType,commonDrugs,chronicDisease, allergies, others from healthinfo where relationuid = ? limit 1'
            let params2 = [queryParams.callerName];
            let sqlItem2 = {
                sql : sql2,
                params:params2
            };
            let queryRes2 = yield db.executeSqlItem(sqlItem2);
            postData.selfInfo = queryRes2[0];
            console.log('postData',postData)
            //let postDataStr = JSON.stringify(postData);
            //postData = JSON.parse(postDataStr)
            //let requestRes = yield tools.sendCenter({
            //    method:"post",
            //    url:"/api/wx/notifyWXData",
            //    data:postData
            //});
            //console.log('requestRes',requestRes);
            //tools.sendCenter(postData);
        }
        if(queryParams.helpType==1){
            let sql3 = 'select relation,realName,sex,age,idNumber,mobilePhone,address'+
                        ' from relatives where openid = ? and uid =? limit 1  ';
            let params3 = [queryParams.callerName,queryParams.helperuid];
            let sqlItem3 = {
                sql : sql3,
                params:params3
            };
            let queryRes3= yield db.executeSqlItem(sqlItem3);
            postData.helperuid = queryParams.helperuid;
            postData.relationInfo = queryRes3[0];


            let sql4 = 'select height,weight,bloodType,commonDrugs,chronicDisease, allergies, others from healthinfo  where relationuid = ? limit 1'
            let params4 = [queryParams.helperuid];
            let sqlItem4 = {
                sql : sql4,
                params:params4
            };
            let queryRes4 = yield db.executeSqlItem(sqlItem4);
            postData.relationInfo = Object.assign(postData.relationInfo,queryRes4[0]);
            //let postDataStr = JSON.stringify(postData);
            //postData = JSON.parse(postDataStr)
            //console.log('postData',postData)
            //let requestRes = yield tools.sendCenter({
            //    method:"post",
            //    url:"/api/wx/notifyWXData",
            //    data:postData
            //});
            //console.log('requestRes',requestRes);
        }
        if(queryParams.helpType==2){
            console.log('postData',postData)
        }
        let postDataStr = JSON.stringify(postData);
        postData = JSON.parse(postDataStr)
        //try{
        //    let requestRes = yield tools.sendCenter({
        //        method:"post",
        //        url:"/api/wx/notifyWXData",
        //        data:postData
        //    });
        //    console.log('requestRes',requestRes);
        //}catch(err){
        //    console.log('notifyWXData',err);
        //}

        let requestRes = yield tools.sendCenter({
                method:"post",
                url:"/api/wx/notifyWXData",
                data:postData
        });

        tools.echoSuccess(res,"success",{uid:uid,time:time});
        //console.log('notifyWXData',err);

    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
};

//
exports.acceptMessage  =(req,res)=>{

    let queryParams = req.body;
    console.log('acceptMessage',queryParams)
    tools.echoSuccess(res,"success",queryParams);
};


//获取中心信息
exports.getCenterBaseInfo  =(req,res)=>{
    let queryParams = req.query;
    let cityCode  =queryParams.cityCode;

    co(function* () {
        var sql = 'select * from centerinfo where cityCode = ? limit 1';
        var params = [cityCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

}

//获取基本个人信息
exports.getBasePersonInfo  =(req,res)=>{
    let queryParams = req.query;
    let openid  =queryParams.openid;

    co(function* () {
        var sql = 'select nickname,headimgurl from user where openid = ? limit 1';
        var params = [openid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//获取详细个人信息
exports.getDetailPersonInfo  =(req,res)=>{
    let queryParams = req.query;
    let openid  =queryParams.openid;

    co(function* () {
        var sql = 'select nickname,headimgurl,headimgurl,realName,sex,age,idNumber,mobilePhone,address,contactPerson1,linkTele1,contactPerson2,linkTele2' +
                  ' from user where openid = ? limit 1';
        var params = [openid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
};

//编辑个人详细信息
exports.editDetailPersonInfo  =(req,res)=>{
    let queryParams = req.body;
    let time = tools.getCurrentTime();
    let checkOut = false;

    console.log(queryParams);

    co(function* () {
        if(!queryParams.isRegistered||queryParams.isRegistered=='false'){
            var sql1 = 'select verificationCode from sms where phone =? and TIMESTAMPDIFF(SECOND, sendTime, ?) < 180 order by sendTime desc limit 1  '
            var params1 = [queryParams.mobilePhone||null,time];
            var sqlItem1 = {
                sql : sql1,
                params:params1
            };
            console.log(sqlItem1);
            var queryRes1 = yield db.executeSqlItem(sqlItem1);
            if(queryRes1.length==0){
                tools.echoError(res, "verificationCodeFalse", "验证码错误");
            }else if(queryParams.verificationCode != queryRes1[0].verificationCode){
                tools.echoError(res, "verificationCodeFalse", "验证码错误");
            }else{
                var sql = 'update user set realName=?,sex=?,age=?,idNumber=?,mobilePhone=?,address=?,contactPerson1=?,linkTele1=?,contactPerson2=?,linkTele2=?' +
                    ' where openid = ?  limit 1';
                var params = [queryParams.realName||null,queryParams.sex||null,queryParams.age||null,queryParams.idNumber||null,queryParams.mobilePhone||null,queryParams.address||null,queryParams.contactPerson1||null,queryParams.linkTele1||null,queryParams.contactPerson2||null,queryParams.linkTele2||null,queryParams.openid];
                var sqlItem = {
                    sql : sql,
                    params:params
                };
                console.log(sqlItem);
                var queryRes = yield db.executeSqlItem(sqlItem);
                console.log(queryRes);
                tools.echoSuccess(res,"success",queryRes);
            }
        }else{
            var sql2 = 'update user set realName=?,sex=?,age=?,idNumber=?,mobilePhone=?,address=?,contactPerson1=?,linkTele1=?,contactPerson2=?,linkTele2=?' +
                ' where openid = ?  limit 1';
            var params2 = [queryParams.realName||null,queryParams.sex||null,queryParams.age||null,queryParams.idNumber||null,queryParams.mobilePhone||null,queryParams.address||null,queryParams.contactPerson1||null,queryParams.linkTele1||null,queryParams.contactPerson2||null,queryParams.linkTele2||null,queryParams.openid];
            var sqlItem2 = {
                sql : sql2,
                params:params2
            };
            console.log(sqlItem2);
            var queryRes2 = yield db.executeSqlItem(sqlItem2);
            console.log(queryRes2);
            tools.echoSuccess(res,"success",queryRes2);
        }


    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
};

//验证电话号码是否注册过
exports.checkMobilePhone=(req,res)=>{
    let queryParams = req.query;
    co(function* () {
        var sql = 'select openid from user where cityCode= ? and mobilePhone = ?';
        var params = [queryParams.cityCode,queryParams.mobilePhone];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        if(queryRes.length==0){
            tools.echoSuccess(res,"success",{register:'no'});
        }else{
            tools.echoSuccess(res,"success",{register:'yes'});
        }
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
};

//获取亲朋列表
exports.getRelativesList =(req,res)=>{
    let queryParams = req.query;
    let openid  =queryParams.openid;

    co(function* () {
        var sql = 'select uid,relation,realName,address from relatives where openid = ? ';
        var params = [openid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//获取亲朋信息
exports.getRelatives =(req,res)=>{
    let queryParams = req.query;
    let uid  =queryParams.uid;

    co(function* () {
        var sql = 'select relation,realName,sex,age,idNumber,mobilePhone,address from relatives where uid = ? limit 1';
        var params = [uid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//删除亲朋
exports.delRelatives  =(req,res)=>{
    let queryParams = req.body;
    let uid  = queryParams.uid;
    co(function* () {
        var sql = 'delete from relatives where uid=?';
        var params = [uid];
        var sqlItem = {
            sql : sql,
            params:params
        };
         var queryRes = yield db.executeSqlItem(sqlItem);

    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
    co(function* () {
        var sql1 = 'delete from healthinfo where relationuid=?';
        var params1 = [uid];
        var sqlItem1 = {
            sql : sql1,
            params:params1
        };
        var queryRes1 = yield db.executeSqlItem(sqlItem1);
        console.log(queryRes1);
        tools.echoSuccess(res,"success",queryRes1);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
};



//获取健康信息
exports.getHealthInfo  =(req,res)=>{
    let queryParams = req.query;
    let relationuid  =queryParams.relationuid;
    co(function* () {
        var sql = 'select height,weight,bloodType,commonDrugs,chronicDisease,allergies,others' +
            ' from healthinfo where relationuid = ? limit 1';
        var params = [relationuid];
        var sqlItem = {
            sql : sql,
            params:params
        };
        console.log(sqlItem);
        var queryRes = yield db.executeSqlItem(sqlItem);
        console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//增加或编辑健康信息 以及亲朋信息
exports.editHealthInfo  =(req,res)=>{
    let queryParams = req.body;
	console.log(queryParams);
    let relationuid  = queryParams.relationuid;
    console.log(relationuid);
    console.log(relationuid!='null');
    if(relationuid!='null'){
 if(queryParams.relation!='null'){
            co(function* () {
                var sql10 = "update `relatives` set relation=?,realName=?,sex=?,age=?,idNumber=?,mobilePhone=?,address=?"+
                    ' where uid = ? limit 1';
                var params10 = [queryParams.relation||null,queryParams.realName||null,queryParams.sex||null,queryParams.age||null,queryParams.idNumber||null,queryParams.mobilePhone||null,queryParams.address||null,relationuid];
                var sqlItem10 = {
                    sql : sql10,
                    params:params10
                };
                var queryRes10 = yield db.executeSqlItem(sqlItem10);
               
            }).catch(function(err){
                tools.echoError(res, "db error", err);
            });
        }

        co(function* () {
            var sql = 'select relationuid from healthinfo where relationuid = ? limit 1 ';
            var params = [relationuid];
            var sqlItem = {
                sql : sql,
                params:params
            };
            var queryRes = yield db.executeSqlItem(sqlItem);
            if(queryRes.length==0){
                co(function* () {
                    var sql1 = "INSERT into `healthinfo` set relationuid=?,height=?,weight=?,bloodType=?,commonDrugs=?,chronicDisease=?,allergies=?,others=?";
                    var params1 = [relationuid,queryParams.height||null,queryParams.weight||null,queryParams.bloodType||null,queryParams.commonDrugs||null,queryParams.chronicDisease||null,queryParams.allergies||null,queryParams.others||null];
                    var sqlItem1 = {
                        sql : sql1,
                        params:params1
                    };
                    var queryRes1 = yield db.executeSqlItem(sqlItem1);
                    tools.echoSuccess(res,"success",queryRes);
                }).catch(function(err){
                    tools.echoError(res, "db error", err);
                });
            }else{
                co(function* () {
                    var sql2 = "update `healthinfo` set height=?,weight=?,bloodType=?,commonDrugs=?,chronicDisease=?,allergies=?,others=?"+
                        ' where relationuid = ? limit 1';
                    var params2 = [queryParams.height||null,queryParams.weight||null,queryParams.bloodType||null,queryParams.commonDrugs||null,queryParams.chronicDisease||null,queryParams.allergies||null,queryParams.others||null,relationuid];
                    var sqlItem2 = {
                        sql : sql2,
                        params:params2
                    };
                    var queryRes2 = yield db.executeSqlItem(sqlItem2);
                    tools.echoSuccess(res,"success",queryRes);
                }).catch(function(err){
                    tools.echoError(res, "db error", err);
                });
            }
        }).catch(function(err){
            console.log(err);
            tools.echoError(res, "db error", err);
        });
    }else{
        var uid = tools.getDateString(new Date()) + tools.getUid();
        console.log(uid);
        co(function* () {
            var sql3 =  'insert into relatives set uid=?,openid=?,relation=?,realName=?,sex=?,age=?,idNumber=?,mobilePhone=?,address=?' ;
            var params3 = [uid,queryParams.openid||null,queryParams.relation||null,queryParams.realName||null,queryParams.sex||null,queryParams.age||null,queryParams.idNumber||null,queryParams.mobilePhone||null,queryParams.address||null];
            var sqlItem3 = {
                sql : sql3,
                params:params3
            };
            var queryRes3 = yield db.executeSqlItem(sqlItem3);
        }).catch(function(err){
            tools.echoError(res, "db error", err);
        });
        co(function* () {
            var sql4 =  'insert into healthinfo set relationuid=?,height=?,weight=?,bloodType=?,commonDrugs=?,chronicDisease=?,allergies=?,others=?' ;
            var params4 = [uid,queryParams.height||null,queryParams.weight||null,queryParams.bloodType||null,queryParams.commonDrugs||null,queryParams.chronicDisease||null,queryParams.allergies||null,queryParams.others||null];
            var sqlItem4 = {
                sql : sql4,
                params:params4
            };
            var queryRes4 = yield db.executeSqlItem(sqlItem4);
            tools.echoSuccess(res,"success",queryRes4);
        }).catch(function(err){
            tools.echoError(res, "db error", err);
        });
    }

};

//返回用户信息
exports.getUserInfo  =(req,res)=>{
    let queryParams = req.query;
    let mobilePhone = queryParams.mobilePhone;
    let cityCode = queryParams.cityCode;
    co(function* () {
        var sql = 'select openid,realName,sex,age,idNumber,mobilePhone,address,contactPerson1,linkTele1,contactPerson2,linkTele2' +
            ' from user where mobilePhone = ? and cityCode=?';
        var params = [mobilePhone,cityCode];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        if(queryRes.length==0){
            tools.echoSuccess(res,"success",{ Wxyh: 'no' }); //不是微信用户返回
        }else{
            co(function* () {
                var userInfo=queryRes[0];
                let time = tools.getCurrentTime();
                var sql1 = 'select callTime, eventAddress,lng,lat,helpType,helperuid,lsh from event where callerName=? and TIMESTAMPDIFF(SECOND, callTime, ?) < 180 order by callTime desc';
                var params1=[userInfo.openid,time];
                var sqlItem1 = {
                    sql : sql1,
                    params:params1
                };
                var queryRes1 = yield db.executeSqlItem(sqlItem1);
                console.log(queryRes1);
                if(queryRes1.length==0){
                    tools.echoSuccess(res,"success",{ Wxhj: 'no' });//不是微信呼救
                }else{
                    var eventInfo = queryRes1[0];
                    co(function* () {
                        var sql4 =  'update event SET eventProperty=1  where lsh = ? limit 1' ;
                        var params4 = [eventInfo.lsh];
                        var sqlItem4 = {
                            sql : sql4,
                            params:params4
                        };
                        var queryRes4 = yield db.executeSqlItem(sqlItem4);
                    }).catch(function(err){
                        tools.echoError(res, "db error", err);
                    });
                    var result = Object.assign(userInfo,eventInfo);
                    if(eventInfo.helpType==0){ //本人呼救
                        co(function* () {
                            var sql2 =  'select  height,weight,bloodType,commonDrugs,chronicDisease,allergies,others from healthinfo where relationuid = ?' ;
                            var params2 = [result.openid];
                            var sqlItem2 = {
                                sql : sql2,
                                params:params2
                            };
                            var queryRes2 = yield db.executeSqlItem(sqlItem2);
                            console.log(queryRes2);
                            result.selfInfo=queryRes2[0];
                            tools.echoSuccess(res,"success",result);
                        }).catch(function(err){
                            tools.echoError(res, "db error", err);
                        });
                    }else if(eventInfo.helpType==1){ //亲朋呼救
                        co(function* () {
                            var sql3 =  ' select relation,realName,sex,age,idNumber,mobilePhone,address, height,weight,bloodType,commonDrugs,chronicDisease,allergies,others'+
                                ' from relatives r left join healthinfo h on r.uid = h.relationuid  where uid = ?' ;
                            var params3 = [result.helperuid];
                            var sqlItem3 = {
                                sql : sql3,
                                params:params3
                            };
                            var queryRes3 = yield db.executeSqlItem(sqlItem3);
                            result.relationInfo=queryRes3[0];
                            tools.echoSuccess(res,"success",result);
                        }).catch(function(err){
                            tools.echoError(res, "db error", err);
                        });
                    }else{ //他人呼救
                        tools.echoSuccess(res,"success",result);
                    }
                }
            }).catch(function(err){
                tools.echoError(res, "db error", err);
            });
        }
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

};

//设置事件节点
exports.setEventNode = (req,res) =>{
    let queryParams = req.body;
    console.log('setEventNode',queryParams);
    co(function* () {
        var sql = ' replace into event_task(lsh,taskCode,handleTime,dispatchTime,vehicleCode,doctor,driver,nurse,platenumber'+
                  ' ,ambulanceTelCode,taskDriveToTime,taskArriveTime,taskLeaveTime,taskBackHospitalTime,taskStopTime,taskEndTime)'+
                  ' values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        var params = [queryParams.lsh,queryParams.taskCode,queryParams.handleTime||null,queryParams.dispatchTime||null,queryParams.vehicleCode,queryParams.doctorName
                      ,queryParams.driverName,queryParams.nurseName,queryParams.plateNumber,queryParams.phoneNumber,queryParams.taskDriveToTime||null
                      ,queryParams.taskArriveTime||null,queryParams.taskLeaveTime||null,queryParams.taskBackHospitalTime||null,queryParams.taskStopTime||null
                      ,queryParams.taskEndTime||null];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });

}

//获取事件节点
exports.getEventNode = (req,res) =>{
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sql = ' select *'+
            ' from event_task where lsh=?'+
            ' order by id';
        var params = [queryParams.lsh];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
	console.log(queryRes);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
}

//获取服务记录
exports.getServiceRecord = (req,res) =>{
    let queryParams = req.query;
    console.log(queryParams);
    co(function* () {
        var sql = ' select lsh,callTime,eventAddress,helpTypeName,relation,realName'+
            ' from event e left join  define_helpType dh on e.helpType=dh.helpTypeCode'+
            ' left join relatives r on  e.helperuid = r.uid '+
            ' where callerName=? and eventProperty =1'+
            ' order by  callTime  desc';
        var params = [queryParams.callerName];
        var sqlItem = {
            sql : sql,
            params:params
        };
        var queryRes = yield db.executeSqlItem(sqlItem);
        tools.echoSuccess(res,"success",queryRes);
    }).catch(function(err){
        console.log(err);
        tools.echoError(res, "db error", err);
    });
}
