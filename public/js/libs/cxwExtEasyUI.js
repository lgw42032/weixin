var cxw = cxw || {};

/**
 * 更改easyui加载panel时的提示文字
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.panel.defaults, {
    loadingMessage: '加载中....'
});

/**
 * 更改easyui加载grid时的提示文字
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.datagrid.defaults, {
    loadMsg: '数据加载中....'
});

/**
 * panel关闭时回收内存，主要用于layout使用iframe嵌入网页时的内存泄漏问题
 *
 * @requires jQuery,EasyUI
 *
 */
$.extend($.fn.panel.defaults, {
    onBeforeDestroy: function () {
        var frame = $('iframe', this);
        try {
            if (frame.length > 0) {
                for (var i = 0; i < frame.length; i++) {
                    frame[i].src = '';
                    frame[i].contentWindow.document.write('');
                    frame[i].contentWindow.close();
                }
                frame.remove();
                if (navigator.userAgent.indexOf("MSIE") > 0) {// IE特有回收内存方法
                    try {
                        CollectGarbage();
                    } catch (e) {
                    }
                }
            }
        } catch (e) {
        }
    }
});

/**
 * 扩展tree和combotree，使其支持平滑数据格式
 *
 * @requires jQuery,EasyUI
 *
 */
cxw.loadFilter = {
    loadFilter: function (data, parent) {
        var opt = $(this).data().tree.options;
        var idField, textField, parentField;
        if (opt.parentField) {
            idField = opt.idField || 'id';
            textField = opt.textField || 'text';
            parentField = opt.parentField || 'pid';
            var i, l, treeData = [], tmpMap = [];
            for (i = 0, l = data.length; i < l; i++) {
                tmpMap[data[i][idField]] = data[i];
            }
            for (i = 0, l = data.length; i < l; i++) {
                if (tmpMap[data[i][parentField]] && data[i][idField] != data[i][parentField]) {
                    if (!tmpMap[data[i][parentField]]['children'])
                        tmpMap[data[i][parentField]]['children'] = [];
                    data[i]['text'] = data[i][textField];
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                } else {
                    data[i]['text'] = data[i][textField];
                    treeData.push(data[i]);
                }
            }
            return treeData;
        }
        return data;
    }
};
$.extend($.fn.combotree.defaults, cxw.loadFilter);
$.extend($.fn.tree.defaults, cxw.loadFilter);


/**
 * 扩展treegrid，使其支持平滑数据格式
 *
 * @requires jQuery,EasyUI
 *
 */
$.extend($.fn.treegrid.defaults, {
    loadFilter: function (data, parentId) {
        var opt = $(this).data().treegrid.options;
        var idField, treeField, parentField;
        if (opt.parentField) {
            idField = opt.idField || 'id';
            treeField = opt.textField || 'text';
            parentField = opt.parentField || 'pid';
            var i, l, treeData = [], tmpMap = [];
            for (i = 0, l = data.length; i < l; i++) {
                tmpMap[data[i][idField]] = data[i];
            }
            for (i = 0, l = data.length; i < l; i++) {
                if (tmpMap[data[i][parentField]] && data[i][idField] != data[i][parentField]) {
                    if (!tmpMap[data[i][parentField]]['children'])
                        tmpMap[data[i][parentField]]['children'] = [];
                    data[i]['text'] = data[i][treeField];
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                } else {
                    data[i]['text'] = data[i][treeField];
                    treeData.push(data[i]);
                }
            }
            return treeData;
        }
        return data;
    }
});


/**
 * 创建一个模式化的dialog
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 *
 */
cxw.modalDialog = function (options) {
    var opts = $.extend({
        title: '&nbsp;',
        width: 640,
        height: 480,
        modal: true,
        onClose: function () {
            $(this).dialog('destroy');
        }
    }, options);
    opts.modal = true;// 强制此dialog为模式化，无视传递过来的modal参数
    if (options.url) {
        opts.content = '<iframe id="" src="' + options.url + '" allowTransparency="true" scrolling="auto" width="100%" height="98%" frameBorder="0" name=""></iframe>';
    }
    return $('<div/>').dialog(opts);
};


/**
 * 扩展validatebox，添加新的验证功能
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.validatebox.defaults.rules, {
    eqPwd: {
        /* 验证两次密码是否一致功能 */
        validator: function (value, param) {
            return value == $(param[0]).val();
        },
        message: '密码不一致！'
    }
});


/**
 * 更换主题
 *
 * @author 崔兴伟
 * @requires jQuery,EasyUI
 * @param themeName
 */
cxw.changeTheme = function (themeName) {
    var $easyuiTheme = $('#easyuiTheme');
    var url = $easyuiTheme.attr('href');
    var href = url.substring(0, url.indexOf('themes')) + 'themes/' + themeName
        + '/easyui.css';
    $easyuiTheme.attr('href', href);

    var $iframe = $('iframe');
    if ($iframe.length > 0) {
        for (var i = 0; i < $iframe.length; i++) {
            var ifr = $iframe[i];
            try {
                $(ifr).contents().find('#easyuiTheme').attr('href', href);
            } catch (e) {
                try {
                    ifr.contentWindow.document.getElementById('easyuiTheme').href = href;
                } catch (e) {
                }
            }
        }
    }

    cxw.cookie('easyuiTheme', themeName, {
        expires: 7
    });
};

/**
 * @author 崔兴伟
 * @date 2014-11-5 合并单元格扩展
 * @param {Object}  jq
 * @param {Object} fields
 * @memberOf {TypeName}
 * @return {TypeName}
 *
 */
$.extend($.fn.datagrid.methods, {
    autoMergeCells: function (jq, fields) {
        return jq.each(function () {
            var target = $(this);
            if (!fields) {
                fields = target.datagrid("getColumnFields");
            }
            var rows = target.datagrid("getRows");
            var i = 0, j = 0, temp = {};
            for (i; i < rows.length; i++) {
                var row = rows[i];
                j = 0;
                for (j; j < fields.length; j++) {
                    var field = fields[j];
                    var tf = temp[field];
                    if (!tf) {
                        tf = temp[field] = {};
                        tf[row[field]] = [i];
                    } else {
                        var tfv = tf[row[field]];
                        if (tfv) {
                            tfv.push(i);
                        } else {
                            tfv = tf[row[field]] = [i];
                        }
                    }
                }
            }
            $.each(temp, function (field, colunm) {
                $.each(colunm, function () {
                    var group = this;

                    if (group.length > 1) {
                        var before, after, megerIndex = group[0];
                        for (var i = 0; i < group.length; i++) {
                            before = group[i];
                            after = group[i + 1];
                            if (after && (after - before) == 1) {
                                continue;
                            }
                            var rowspan = before - megerIndex + 1;
                            if (rowspan > 1) {
                                target.datagrid('mergeCells', {
                                    index: megerIndex,
                                    field: field,
                                    rowspan: rowspan
                                });
                            }
                            if (after && (after - before) != 1) {
                                megerIndex = after;
                            }
                        }
                    }
                });
            });
        });
    }
});

/**
 * 验证开始时间小于结束时间
 */
cxw.checkStartTimeBeforeEndTime = function (startTime, endTime) {
    if ($(startTime).datetimebox('getValue') <= $(endTime).datetimebox('getValue')) {
        return true;
    } else {
        return false;
    }
};
/**
 * 验证一个数小于另一个数
 */
cxw.checkMinBeforeMax = function (min, max) {
    if ($(max).numberbox('getValue') == ""
        || ($(min).numberbox('getValue') <= $(max).numberbox('getValue'))) {
        return true;
    } else {
        return false;
    }
}

/**
 * 扩展validatebox，添加新的验证功能
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.validatebox.defaults.rules, {
    validCarCode: {
        /* 验证车载应该为5位数字字符串 */
        validator: function (value, param) {
            return !isNaN(value) && value.length == 5;
        },
        message: '车辆编码为5位有效数字！'
    },
    validPhoneNo:{
        /* 验证车载号码不重复 */
        validator: function (value, param) {
           /* $.post('/basic/vehicleNotExist', {"phoneNumber" : value},function(res){
                if(res === 'true'){
                    return true;
                }
            },"json");*/
            $.ajax({
                type : 'post',
                // dataType:'json',
                url : '/basic/vehicleNotExist',
                data : {
                    "phoneNumber" : value
                }
               ,
                success : function(res) {
                    if(res === 'true'){

                    }
                }
            });
             return false;
        },
        message: '车载号码重复！'
    }

});

/**
 * 扩展validatebox，添加新的验证功能
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.validatebox.defaults.rules, {
    validJobNo: {
        /* 验证人员工号应该为5位数字字符串 */
        validator: function (value, param) {
            return !isNaN(value) && value.length == 5;
        },
        message: '人员工号应该为5位数字！'
    }
});

/**
 * 扩展validatebox，添加新的验证功能
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.validatebox.defaults.rules, {
    validStationCode: {
        /* 验证单位编码应该为9位数字字符串 */
        validator: function (value, param) {
            return !isNaN(value) && value.length == 3;
        },
        message: '分站编码为3位数字'
    }
});

/**
 * 通用验证功能
 */
$.extend($.fn.validatebox.defaults.rules, {
    CHS: {
        validator: function (value, param) {
            return /^[\u0391-\uFFE5]+$/.test(value);
        },
        message: '请输入汉字'
    },
    english: {// 验证英语
        validator: function (value) {
            return /^[A-Za-z]+$/i.test(value);
        },
        message: '请输入英文'
    },
    ip: {// 验证IP地址
        validator: function (value) {
            return /\d+\.\d+\.\d+\.\d+/.test(value);
        },
        message: 'IP地址格式不正确'
    },
    ZIP: {
        validator: function (value, param) {
            return /^[0-9]\d{5}$/.test(value);
        },
        message: '邮政编码不存在'
    },
    QQ: {
        validator: function (value, param) {
            return /^[1-9]\d{4,10}$/.test(value);
        },
        message: 'QQ号码不正确'
    },
    mobile: {
        validator: function (value, param) {
            return /^(?:13\d|15\d|18\d)-?\d{5}(\d{3}|\*{3})$/.test(value);
        },
        message: '手机号码不正确'
    },
    tel: {
        validator: function (value, param) {
            return /^(\d{3}-|\d{4}-)?(\d{8}|\d{7})?(-\d{1,6})?$/.test(value);
        },
        message: '电话号码不正确'
    },
    mobileAndTel: {
        validator: function (value, param) {
            return /(^([0\+]\d{2,3})\d{3,4}\-\d{3,8}$)|(^([0\+]\d{2,3})\d{3,4}\d{3,8}$)|(^([0\+]\d{2,3}){0,1}13\d{9}$)|(^\d{3,4}\d{3,8}$)|(^\d{3,4}\-\d{3,8}$)/.test(value);
        },
        message: '请正确输入电话号码'
    },
    number: {
        validator: function (value, param) {
            return /^[0-9]+.?[0-9]*$/.test(value);
        },
        message: '请输入数字'
    },
    money: {
        validator: function (value, param) {
            return (/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(value);
        },
        message: '请输入正确的金额'

    },
    mone: {
        validator: function (value, param) {
            return (/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(value);
        },
        message: '请输入整数或小数'

    },
    integer: {
        validator: function (value, param) {
            return /^[+]?[1-9]\d*$/.test(value);
        },
        message: '请输入最小为1的整数'
    },
    integ: {
        validator: function (value, param) {
            return /^[+]?[0-9]\d*$/.test(value);
        },
        message: '请输入整数'
    },
    range: {
        validator: function (value, param) {
            if (/^[1-9]\d*$/.test(value)) {
                return value >= param[0] && value <= param[1]
            } else {
                return false;
            }
        },
        message: '输入的数字在{0}到{1}之间'
    },
    minLength: {
        validator: function (value, param) {
            return value.length >= param[0]
        },
        message: '至少输入{0}个字'
    },
    maxLength: {
        validator: function (value, param) {
            return value.length <= param[0]
        },
        message: '最多{0}个字'
    },
    //select即选择框的验证
    selectValid: {
        validator: function (value) {
            // console.log(value);
            if (value == '--请选择--') {
                return false;
            } else {
                return true;
            }
        },
        message: '请选择'
    },
    idCode: {
        validator: function (value, param) {
            return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
        },
        message: '请输入正确的身份证号'
    },
    loginName: {
        validator: function (value, param) {
            return /^[\u0391-\uFFE5\w]+$/.test(value);
        },
        message: '登录名称只允许汉字、英文字母、数字及下划线。'
    },
    equalTo: {
        validator: function (value, param) {
            return value == $(param[0]).val();
        },
        message: '两次输入的字符不一至'
    },
    englishOrNum: {// 只能输入英文和数字
        validator: function (value) {
            return /^[a-zA-Z0-9_ ]{1,}$/.test(value);
        },
        message: '请输入英文、数字、下划线或者空格'
    },
    xiaoshu: {
        validator: function (value) {
            return /^(([1-9]+)|([0-9]+\.[0-9]{1,2}))$/.test(value);
        },
        message: '最多保留两位小数！'
    },
    ddPrice: {
        validator: function (value, param) {
            if (/^[1-9]\d*$/.test(value)) {
                return value >= param[0] && value <= param[1];
            } else {
                return false;
            }
        },
        message: '请输入1到100之间正整数'
    },
    jretailUpperLimit: {
        validator: function (value, param) {
            if (/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)) {
                return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
            } else {
                return false;
            }
        },
        message: '请输入0到100之间的最多俩位小数的数字'
    },
    rateCheck: {
        validator: function (value, param) {
            if (/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)) {
                return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
            } else {
                return false;
            }
        },
        message: '请输入0到1000之间的最多俩位小数的数字'
    }
});
