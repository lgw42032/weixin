/* 本月第一天 */
function firstOfMouth() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    return y + '-' + (m < 10 ? ('0' + m) : m) + "-01 " + "00:00:00";
}
/* 当前日期 */
function getCurrentTime() {
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
}

function getCurrentDate() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    var d = curr_time.getDate();
    var hh = curr_time.getHours();
    var mm = curr_time.getMinutes();
    var ss = curr_time.getSeconds();
    return y + (m < 10 ? ('0' + m) : m) + (d < 10 ? ('0' + d) : d) + (hh < 10 ? ('0' + hh) : hh)
        + (mm < 10 ? ('0' + mm) : mm) + (ss < 10 ? ('0' + ss) : ss);
}
/*判断字符串是否为空*/
function isBlankOrEmpty(data) {
    if (data == '' || data == undefined || data == null || data == 'undefined') {
        return true;
    } else {
        return false;
    }
}

/**
 * 计算与当前时间得差是否大于2两（48小时）
 * @param recordTime
 */
function isPassTwoDay(recordTime) {
    recordTime = recordTime.replace(/-/g, "/");
    recordTime = new Date(recordTime);
    var currentTime = getCurrentTime().replace(/-/g, "/");
    currentTime = new Date(currentTime);
    var date = 0; //时间差
    date = currentTime - recordTime;
    var hours = Math.floor(date / (3600 * 1000));
    if (hours > 48) {
        return true;
    } else {
        return false;
    }
}

/**
 * 获取当前日期前后AddDayCount天
 * @param AddDayCount
 * @returns {string}
 * @constructor
 */
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d + " 08:00:00";
}
function GetDefaultStartTime() {
    var startDay = -7;
    var startTime = "08:00:00";
    var dd = new Date();
    dd.setDate(dd.getDate() + startDay);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d + " " + startTime;
}
/**
 * 判断是否为空
 * @returns {boolean}
 */
function isEmpty(data) {
    if (typeof data == "string") {
        if (data == "") {
            return true;
        }
    }
    if (typeof data == 'undefined' || data == null || data === undefined) {
        return true;
    }

    if (typeof(data) == 'object' && Object.keys(data).length === 0) {
        return true;
    }
    return false;
}

/**
 * 判断登录用户是否有操作权限
 * @param item
 * @param arr
 * @returns {boolean}
 */
function havePermissions(item, arr) {
    if (isBlankOrEmpty(arr)) {
        return false;
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (item == arr[i]) {
                return true;
            }
        }
        return false;
    }
}

function getCaseCount(count) {
    if (isNaN(count)) {
        count = 0;
    }
    count = parseInt(count);
    count += 1;
    if(count<10){
        count = '0' + count;
    }
    return count;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}