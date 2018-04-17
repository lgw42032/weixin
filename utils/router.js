const express = require('express');
const service = require('./service.js');
const router = express.Router();
const config = require('../config.json');
const accountInfo = require('../accountInfo.json');
console.log('accountInfo',accountInfo);
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

/*公众号后台管理*/
//router.get('/',function(req,res){
//    res.render('../public/login');
//})

//发送验证码
router.post('/sendMessage',service.sendMessage);


//获取配置文件
router.get('/getConfig', function(req, res) {
    res.json(config);
});

//获取账户信息
router.get('/getAccountInfo', function(req, res) {
    const accountInfo1 = require('../accountInfo.json');
    res.json(accountInfo1);
});

//增加中心
router.post('/addCenter',service.addCenter);
//中心登陆
router.get('/login',service.login);
//编辑关于我们
router.post('/editAboutUs',service.editAboutUs);
//编辑联系方式和中心地址
router.post('/editContactUs',service.editContactUs);
//编辑轮播图
router.post('/editCenterImgUrl',service.editCenterImgUrl);
//获取网络医院信息
router.get('/getHospitalNet',service.getHospitalNet);
//增加医院
router.post('/addHospital',service.addHospital);
//删除医院
router.post('/delHospital',service.delHospital);
//获取车辆列表
router.get('/getVehicles',service.getVehicles);
//增加车辆
router.post('/addVehicle',service.addVehicle);
//删除车辆
router.post('/delVehicle',service.delVehicle);
//查询车辆
router.get('/searchVehicles',service.searchVehicles);

//获取养生食疗全部列表
router.get('/getCenterRegimenDietAllList',service.getCenterRegimenDietAllList);
//获取养生食疗列表
router.get('/getCenterRegimenDietList',service.getCenterRegimenDietList);
//获取养生食疗条目
router.get('/getCenterRegimenDietItem',service.getCenterRegimenDietItem);
//增加养生食疗条目
router.post('/addCenterRegimenDietItem',service.addCenterRegimenDietItem);
//删除养生食疗条目
router.post('/delCenterRegimenDietItem',service.delCenterRegimenDietItem);
//获取急救常识分类全部列表

router.get('/getAidKnowledgeCategoryAllList',service.getAidKnowledgeCategoryAllList);
//获取急救常识分类列表
router.get('/getAidKnowledgeCategoryList',service.getAidKnowledgeCategoryList);
//获取急救常识分类条目
router.get('/getAidKnowledgeCategoryItem',service.getAidKnowledgeCategoryItem);
//增加急救常识分类条目
router.post('/addAidKnowledgeCategoryItem',service.addAidKnowledgeCategoryItem);
//删除急救常识分类条目
router.post('/delAidKnowledgeCategoryItem',service.delAidKnowledgeCategoryItem);

//获取急救常识全部列表
router.get('/getAidKnowledgeAllList',service.getAidKnowledgeAllList);
//获取急救常识列表
router.get('/getAidKnowledgeList',service.getAidKnowledgeList);
//获取急救常识条目
router.get('/getAidKnowledgeItem',service.getAidKnowledgeItem);
//增加急救常识条目
router.post('/addAidKnowledgeItem',service.addAidKnowledgeItem);
//删除急救常识条目
router.post('/delAidKnowledgeItem',service.delAidKnowledgeItem);
//根据分类获取急救常识条目
router.get('/getAidKnowledgeByCategory',service.getAidKnowledgeByCategory);


//获取急救视频全部列表
router.get('/getAidVideoAllList',service.getAidVideoAllList);
//获取急救视频列表
router.get('/getAidVideoList',service.getAidVideoList);
//获取急救视频条目
router.get('/getAidVideoItem',service.getAidVideoItem);
//增加急救视频条目
router.post('/addAidVideoItem',service.addAidVideoItem);
//删除急救视频条目
router.post('/delAidVideoItem',service.delAidVideoItem);

//微信服务器接入
router.get('/yourapi',service.join);
//微信时间交互
router.post('/yourapi',service.interaction);
//智慧急救
router.get('/microAid',service.microAid);
// 微网站
router.get('/microNet',service.microNet);
// 个人中心
router.get('/personalCenter',service.personalCenter);
//个人呼救
router.post('/aidCall',service.aidCall);

//获取中心信息
router.get('/getCenterBaseInfo',service.getCenterBaseInfo);

//获取基本个人信息（昵称，头像）
router.get('/getBasePersonInfo',service.getBasePersonInfo);
//获取详细个人信息
router.get('/getDetailPersonInfo',service.getDetailPersonInfo);
//编辑个人详细信息
router.post('/editDetailPersonInfo',service.editDetailPersonInfo);
//验证电话号码是否注册过
router.get('/checkMobilePhone',service.checkMobilePhone);


router.route('/acceptMessage').post(jsonParser,service.acceptMessage);

//获取亲朋列表
router.get('/getRelativesList',service.getRelativesList);
//获取亲朋信息
router.get('/getRelatives',service.getRelatives);
//删除亲朋
router.post('/delRelatives',service.delRelatives);

//获取健康信息
router.get('/getHealthInfo',service.getHealthInfo);
//增加或编辑健康信息
router.post('/editHealthInfo',service.editHealthInfo);

 //调度系统调用接口,返回用户信息
router.get('/getUserInfo',service.getUserInfo);

//调度系统返回时间节点
router.post('/setEventNode',service.setEventNode);

//用户获取事件节点
router.get('/getEventNode',service.getEventNode);

//用户获取服务记录
router.get('/getServiceRecord',service.getServiceRecord)

module.exports = router;