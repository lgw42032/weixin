/**
 * Created by dell on 2017/11/27.
 */
const gulp = require('gulp');
const cssmin = require('gulp-minify-css');
const uglify  = require('gulp-uglify');
const htmlmin = require('gulp-minify-html');
const imagemin = require('gulp-imagemin');
gulp.task('testCssmin',function(){
    gulp.src('public/css/*.css')
        .pipe(cssmin({
        advanced: true,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
        compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
        keepSpecialComments: '*'
        //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    }))
        .pipe(gulp.dest('dist/public/css'));
});
gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('public/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/public'));
});
gulp.task('jsmin', function () {
    //压缩src/js目录下的所有js文件
    //除了test1.js和test2.js（**匹配src/js的0个或多个子文件夹）
    gulp.src('public/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/public/js'));
});
gulp.task('testImagemin', function () {
    gulp.src('public/images/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('dist/public/images'));
});
gulp.task('watch',['testCssmin', 'testHtmlmin', 'jsmin','testImagemin'],function(){
    //gulp.run('testCssmin', 'testHtmlmin', 'jsmin','testImagemin');
    gulp.watch('public/css/*.css',['testCssmin']);
    gulp.watch('public/*.html',['testHtmlmin']);
    gulp.watch('public/js/*.js',['jsmin']);
    gulp.watch('public/images/*.{png,jpg,gif,ico}',['testImagemin']);
})

