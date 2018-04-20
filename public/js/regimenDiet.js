/**
 * Created by dell on 2017/10/13.
 */
$(function(){
    var headerHeight = $('.header').outerHeight();
    console.log(headerHeight);
    //$('.header-nav').css('top',headerHeight);
    $('.content').css('padding-top',headerHeight);
    //$('.navbar').click(function(){
    //    $('.header-nav').slideToggle();
    //});
});
function pxToRem(px){
    var bit = (document.documentElement.clientWidth)/7.5;
    return px/bit + 'rem';
}