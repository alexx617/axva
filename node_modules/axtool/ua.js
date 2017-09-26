// 获取用户环境
/*
手机浏览器: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1",

MacBook: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
 */
// 使用:var getUA = require('ifun/ua');
// var ua = getUA();
// 或
// var ua = getUA(req.headers['user-agent']);

// 选择符合条件的一个
var filterItem = function (ua, ...args) {
    return args.filter(x=>ua['is'+x])[0] || 'unknown';
};

module.exports = function(userAgent){
    var ua = {};
    var _ua = ua.source = userAgent || navigator.userAgent;

    ua.isIphone = /iphone/i.test(_ua);
    ua.isIpad = /ipad/i.test(_ua);
    ua.isAndroid = /android/i.test(_ua);

    ua.isChrome = /chrome/i.test(_ua);
    ua.isSafari = /safari/i.test(_ua) && !ua.isChrome;
    ua.isFirefox = /firefox/i.test(_ua);
    ua.isIe = /msie/i.test(_ua);
    ua.isOpera = /opera/i.test(_ua);
    ua.isWechat = /MicroMessenger|MQQBrowser/i.test(_ua);

    ua.isCordova = typeof(window)=="object" && window.cordova ? true : false;

    ua.isBrowser = ua.isSafari || ua.isChrome || ua.isFirefox || ua.isIe || ua.isOpera;
    ua.isIos = ua.isIphone || ua.isIpad;
    ua.isMobile = ua.isIos || ua.isAndroid;

    ua.isNative = ua.isMobile && !ua.isBrowser && !ua.isWechat; //有问题

    ua.isWindow = /window/i.test(_ua);
    ua.isMac = /Macintosh/i.test(_ua);
    ua.isLinux = /Linux/i.test(_ua);

    ua.isPc = !ua.isMobile;
    ua.isPad = /pad/i.test(_ua);
    ua.isPhone = ua.isIphone || ua.isAndroid && !ua.isPad;

    ua.deviceType = filterItem(ua, 'Pc', 'Pad', 'Phone');//设备
    ua.device = 'unknown'; //暂时不好判断
    ua.os = filterItem(ua, 'Ios', 'Android', 'Window', 'Mac', 'Linux');//系统
    ua.browser = filterItem(ua, 'Wechat', 'Chrome', 'Safari', 'Firefox', 'Ie', 'Opera');//浏览器

    return ua;
};