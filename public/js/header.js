/**
 * Created by dell on 2017/10/11.
 */
$(function(){
    var headerHeight = $('.header').outerHeight();
    console.log(headerHeight);
    $('.header-nav').css('top',headerHeight);
    $('.banner').css('padding-top',headerHeight);
    $('.regimenDiet-content').css('margin-top',headerHeight);
    $('.aid-class-content').css('margin-top',headerHeight);
    $('.video').css('margin-top',headerHeight);
    $('#main').click(function(){
        $('.header-nav').slideToggle();
        $('#main').toggleClass('main')
    });
    var footerHeight = $('footer').outerHeight();
    console.log(footerHeight);
    $('section.introduce').css({'padding-bottom': footerHeight});
    $('.logo').css('margin-top',((headerHeight-$('.logo').outerHeight())/2))
});
