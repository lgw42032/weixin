///**
// * Created by dell on 2017/10/5.
// */
//const express = require('express');
//const bodyParser = require('body-parser');
//const router = require('./router.js');
//const app = express();
//const getToken = require('./access_token.js');
//const createMeau = require('./createMeau.js');
//getToken.refreshToken();
//createMeau.createMenu();
//app.use('/www',express.static('public'));
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(router);
//app.listen(80,()=>{
//    console.log('running...');
//});
/**
 * Created by Yun heng on 2017-02-16.
 */
const webServer = require('./utils/webServer')
const tools = require('./utils/tools');
//var appLog = require('./utils/appLog');
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
    //appLog.logError('uncaughtException'+JSON.stringify(err))
});
process.once('SIGQUIT', function () {
    process.exit(0);
});

process.once('SIGTERM', function () {
    process.exit(0);
});

process.once('SIGINT', function () {
    process.exit(0);
});
//tools.initDefineData();
webServer.startWebServer();
