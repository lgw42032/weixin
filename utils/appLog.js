/**
 * Created by Yun heng on 2015-08-26.
 */
var log4js = require('log4js');
var maxLogSize = 1024 * 1024 * 2; //2M


log4js.configure({
    appenders: {
        ruleConsole: {type: 'console'},
        normal: {
            type: 'dateFile',
            filename: 'logs/center_normal',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'normal'
        },
        error: {
            type: 'dateFile',
            filename: 'logs/center_error',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'error'
        },

        center_event: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'center_event'
        },
        station: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        remote: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        user: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        debug: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        location: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        cti: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        system: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        sql: {
            type: 'dateFile',
            filename: 'logs/center_event',
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            //category:'center_event'
        },
        //replaceConsole: true,
    },

    "categories": {
        "default": {
            "appenders": [
                "normal",
                "error",
                "center_event",
                "station",
                "remote",
                "user",
                "debug",
                "location",
                "cti",
                "system",
                "sql",
            ],
            "level": "all"
        }
    },
})

/*log4js.configure({
    appenders: [
        { type: 'console'},
        { type: 'file',filename: 'logs/normal.log',maxLogSize: maxLogSize,backups:4, category: 'normal'},
        { type: 'file',filename: 'logs/error.log',maxLogSize: maxLogSize,backups:4, category: 'error'},
        { type: 'file',filename: 'logs/vehicle.log',maxLogSize: maxLogSize,backups:4, category: 'vehicle'},
        { type: 'file',filename: 'logs/event.log',maxLogSize: maxLogSize,backups:4, category: 'event'},
        { type: 'file',filename: 'logs/station.log',maxLogSize: maxLogSize,backups:4, category: 'station'},
        { type: 'file',filename: 'logs/remote.log',maxLogSize: maxLogSize,backups:4, category: 'remote'},
        { type: 'file',filename: 'logs/user.log',maxLogSize: maxLogSize,backups:4, category: 'user'},
        { type: 'file',filename: 'logs/debug.log',maxLogSize: maxLogSize,backups:4, category: 'debug'},
        { type: 'file',filename: 'logs/location.log',maxLogSize: maxLogSize,backups:4, category: 'location'},
        { type: 'file',filename: 'logs/cti.log',maxLogSize: maxLogSize,backups:4, category: 'cti'},
        { type: 'file',filename: 'logs/system.log',maxLogSize: maxLogSize,backups:4, category: 'system'},
        { type: 'file',filename: 'logs/sql.log',maxLogSize: maxLogSize,backups:4, category: 'sql'}
     ],
    replaceConsole: true
});*/

module.exports.logError = function(data){
    var log = log4js.getLogger('error');
    log.error(data);
}
module.exports.logInfo = function(data){
    var log = log4js.getLogger('normal');
    log.info(data);
}
module.exports.logVehicle = function(data){
    var log = log4js.getLogger('vehicle');
    log.info(data);
};
module.exports.logEvent = function(data){
    var log = log4js.getLogger('event');
    log.info(data);
};
module.exports.logStation = function(data){
    var log = log4js.getLogger('station');
    log.info(data);
};
module.exports.logUser = function(data){
    var log = log4js.getLogger('user');
    log.info(data);
};
module.exports.logSystem = function(data){
    var log = log4js.getLogger('system');
    log.info(data);
};
module.exports.logSql = function(data){
    var log = log4js.getLogger('sql');
    log.info(data);
};
module.exports.logCti = function(data){
    var log = log4js.getLogger('cti');
    log.info(data);
};
module.exports.logUser = function(data){
    var log = log4js.getLogger('user');
    log.info(data);
};
module.exports.logRemote = function(data){
    var log = log4js.getLogger('remote');
    log.info(data);
};
module.exports.logDebug = function(data){
    var log = log4js.getLogger('debug');
    log.debug(data);
};
module.exports.logLocation = function(data){
    var log = log4js.getLogger('location');
    log.info(data);
};