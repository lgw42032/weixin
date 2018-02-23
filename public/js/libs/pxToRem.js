/**
 * Created by dell on 2017/10/11.
 */
var oHtml = document.documentElement;
getSize();
window.onresize = function(){
    getSize();
};
function getSize(){
    var screenWidth = oHtml.clientWidth;
    if (screenWidth < 320) {
        oHtml.style.fontSize = '42.6667px';
    } else if(screenWidth > 750){
        oHtml.style.fontSize = '100px';
    }else{
        oHtml.style.fontSize = screenWidth/(750/100) + 'px';
    }
}

