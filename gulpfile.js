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
        advanced: true,//���ͣ�Boolean Ĭ�ϣ�true [�Ƿ����߼��Ż����ϲ�ѡ�����ȣ�]
        compatibility: 'ie7',//����ie7�����¼���д�� ���ͣ�String Ĭ�ϣ�''or'*' [���ü���ģʽ�� 'ie7'��IE7����ģʽ��'ie8'��IE8����ģʽ��'*'��IE9+����ģʽ]
        keepBreaks: false,//���ͣ�Boolean Ĭ�ϣ�false [�Ƿ�������]
        keepSpecialComments: '*'
        //������������ǰ׺ ������autoprefixer���ɵ������ǰ׺�������������������п��ܽ���ɾ����Ĳ���ǰ׺
    }))
        .pipe(gulp.dest('dist/public/css'));
});
gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true,//���HTMLע��
        collapseWhitespace: true,//ѹ��HTML
        collapseBooleanAttributes: true,//ʡ�Բ������Ե�ֵ <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//ɾ�����пո�������ֵ <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//ɾ��<script>��type="text/javascript"
        removeStyleLinkTypeAttributes: true,//ɾ��<style>��<link>��type="text/css"
        minifyJS: true,//ѹ��ҳ��JS
        minifyCSS: true//ѹ��ҳ��CSS
    };
    gulp.src('public/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/public'));
});
gulp.task('jsmin', function () {
    //ѹ��src/jsĿ¼�µ�����js�ļ�
    //����test1.js��test2.js��**ƥ��src/js��0���������ļ��У�
    gulp.src('public/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/public/js'));
});
gulp.task('testImagemin', function () {
    gulp.src('public/images/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 5, //���ͣ�Number  Ĭ�ϣ�3  ȡֵ��Χ��0-7���Ż��ȼ���
            progressive: true, //���ͣ�Boolean Ĭ�ϣ�false ����ѹ��jpgͼƬ
            interlaced: true, //���ͣ�Boolean Ĭ�ϣ�false ����ɨ��gif������Ⱦ
            multipass: true //���ͣ�Boolean Ĭ�ϣ�false ����Ż�svgֱ����ȫ�Ż�
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

