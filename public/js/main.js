/**
 * Created by Dell on 2016/10/16.
 */
var userMenu =  [ { attributes: { target: null, url: null },
    checked: false,
    iconCls: 'ext-icon-application_side_tree',
    description: null,
    id: 'baseInfo',
    text: '基础信息',
    state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'aidClass',
        text: '急救微课',
        state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'regimenDiet',
        text: '养生食疗',
        state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'stationInfo',
        text: '分站信息',
        state: 'open' },
    { attributes: { target: null, url: '/public/contactUs.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'contactUs',
        text: '中心基本信息',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/editAboutUs.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'editAboutUs',
        text: '关于我们内容',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/centerImgUrl.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'centerImgUrl',
        text: '轮播图修改',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/addAidKnowledgeCategory.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidKnowledgeCategory',
        text: '急救常识种类',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/addAidKnowledgeItem.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidKnowledgeItem',
        text: '急救常识条目',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/addAidVideoItem.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidVideoItem',
        text: '急救微视条目',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/editCenterRegimenDiet.html' },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'editRegimenDiet',
        text: '养生食疗',
        state: 'open',
        pid: 'regimenDiet'
    },
    { attributes: { target: null, url: '/public/addHospital.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'hospitalNet',
        text: '网络医院',
        state: 'open',
        pid: 'stationInfo' },
    { attributes: { target: null, url: '/public/addVehicle.html' },
        checked: false,
        iconCls: 'ext-icon-application_edit',
        description: '车辆登记',
        id: 'vehicle',
        text: '车辆登记',
        state: 'open',
        pid: 'stationInfo' }
];
var administrator = [ { attributes: { target: null, url: null },
    checked: false,
    iconCls: 'ext-icon-application_side_tree',
    description: null,
    id: 'baseInfo',
    text: '基础信息',
    state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'aidClass',
        text: '急救微课',
        state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'regimenDiet',
        text: '养生食疗',
        state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'stationInfo',
        text: '分站信息',
        state: 'open' },
    { attributes: { target: null, url: null },
        checked: false,
        iconCls: 'ext-icon-application_side_tree',
        description: null,
        id: 'administrator',
        text: '管理员选项',
        state: 'open' },
    { attributes: { target: null, url: '/public/contactUs.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'contactUs',
        text: '中心基本信息',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/editAboutUs.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'editAboutUs',
        text: '关于我们内容',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/centerImgUrl.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'centerImgUrl',
        text: '轮播图修改',
        state: 'open',
        pid: 'baseInfo' },
    { attributes: { target: null, url: '/public/addAidKnowledgeCategory.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidKnowledgeCategory',
        text: '急救常识分类',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/addAidKnowledgeItem.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidKnowledgeItem',
        text: '急救常识条目',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/addAidVideoItem.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'aidVideoItem',
        text: '急救微视条目',
        state: 'open',
        pid: 'aidClass' },
    { attributes: { target: null, url: '/public/editCenterRegimenDiet.html' },
        checked: false,
        iconCls: 'ext-icon-chart_bar',
        description: null,
        id: 'editRegimenDiet',
        text: '养生食疗',
        state: 'open',
        pid: 'regimenDiet'
    },
    { attributes: { target: null, url: '/public/addHospital.html' },
        checked: false,
        iconCls: 'ext-icon-world',
        description: null,
        id: 'hospitalNet',
        text: '网络医院',
        state: 'open',
        pid: 'stationInfo' },
    { attributes: { target: null, url: '/public/addVehicle.html' },
        checked: false,
        iconCls: 'ext-icon-application_edit',
        description: '车辆登记',
        id: 'vehicle',
        text: '车辆登记',
        state: 'open',
        pid: 'stationInfo' },
    { attributes: { target: null, url: '/public/addCenter.html' },
        checked: false,
        iconCls: 'ext-icon-application_edit',
        description: '增加用户',
        id: 'addCenter',
        text: '增加用户',
        state: 'open',
        pid: 'administrator' }
];
function toggleTab(target) {
    var tabs = $('#mainTabs');
    var opts = {
        title: target.name,
        closable: true,
        iconCls: target.icon,
        content: cxw
            .formatString(
                '<iframe src="{0}" allowTransparency="true" style="border:0;width:100%;height:99%;" frameBorder="0"></iframe>',
                target.url),
        border: false,
        fit: true
    };
    if (tabs.tabs('exists', opts.title)) {
        tabs.tabs('select', opts.title);
    } else {
        tabs.tabs('add', opts);
    }
}
function initPage() {
    var centerInfo = $.cookie("centerInfo");
    centerInfo = eval("(" + $.cookie('centerInfo')+ ")");
    var treeData;
    if(centerInfo.cityCode=='99999'){
      treeData = administrator
    }else{
      treeData =  userMenu;
    }
    mainMenu = $('#mainMenu').tree({
        data: treeData,
        parentField: 'pid',
        method: 'get',
        onClick: function (node) {
            if (node.attributes.url) {
                var src =  node.attributes.url;
                console.log(src);
                if (!cxw.startWith(node.attributes.url, '/')) {
                    src = node.attributes.url;
                    console.log(src);
                }
                if (node.attributes.target && node.attributes.target.length > 0) {
                    window.open(src, node.attributes.target);
                } else {
                    var tabs = $('#mainTabs');
                    var opts = {
                        title: node.text,
                        closable: true,
                        iconCls: node.iconCls,
                        content: cxw.formatString('<iframe src="{0}" allowTransparency="true" style="border:0;width:100%;height:99%;" frameBorder="0"></iframe>', src),
                        border: false,
                        fit: true
                    };


                    if (tabs.tabs('exists', opts.title)) {
                        tabs.tabs('select', opts.title);
                    } else {
                        tabs.tabs('add', opts);
                    }
                }
            }
        }
    });


    mainTabs = $('#mainTabs')
        .tabs(
            {
                fit: true,
                border: false,
                tools: [
                    {
                        iconCls: 'ext-icon-arro w_up',
                        handler: function () {
                            mainTabs.tabs({
                                tabPosition: 'top'
                            });
                        }
                    },
                    {
                        iconCls: 'ext-icon-arrow_down',
                        handler: function () {
                            mainTabs.tabs({
                                tabPosition: 'bottom'
                            });
                        }
                    },
                    {
                        text: '刷新',
                        iconCls: 'ext-icon-arrow_refresh',
                        handler: function () {
                            var panel = mainTabs.tabs(
                                'getSelected').panel(
                                'panel');
                            var frame = panel.find('iframe');
                            try {
                                if (frame.length > 0) {
                                    for (var i = 0; i < frame.length; i++) {
                                        // frame[i].contentWindow.document
                                        //     .write('');
                                        // frame[i].contentWindow
                                        //     .close();
                                        frame[i].src = frame[i].src;
                                    }
                                    // if (navigator.userAgent
                                    //         .indexOf("MSIE") > 0) {// IE特有回收内存方法
                                    //     try {
                                    //         CollectGarbage();
                                    //     } catch (e) {
                                    //     }
                                    // }
                                }
                            } catch (e) {
                            }
                        }
                    },
                    {
                        text: '关闭',
                        iconCls: 'ext-icon-cross',
                        handler: function () {
                            var index = mainTabs
                                .tabs(
                                    'getTabIndex',
                                    mainTabs
                                        .tabs('getSelected'));
                            var tab = mainTabs.tabs('getTab',
                                index);
                            if (tab.panel('options').closable) {
                                mainTabs.tabs('close', index);
                            } else {
                                $.messager
                                    .alert(
                                        '提示',
                                        '['
                                        + tab
                                            .panel('options').title
                                        + ']不可以被关闭！',
                                        'error');
                            }
                        }
                    }]
            });
}



