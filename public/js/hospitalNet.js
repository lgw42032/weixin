/**
 * Created by dell on 2017/10/13.
 */
$(function(){
    var headerHeight = $('.header').outerHeight();
    $('.show-hospitals').css('height',document.documentElement.clientHeight-headerHeight);
    $('.show-hospitals').css('margin-top',headerHeight);
});
