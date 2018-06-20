//***** STYLE GUIDE SCRIPTS - DO NOT CHANGE *****
var comp = getMachineInfo();
var version = '';
var device = '';
var os = '';
if(typeof comp !== "undefined") {
    if(comp.browser === 'IE' || comp.browser === 'Safari') version = 'b-version-' + Array(parseInt(comp.bversion) + 1).join("i") + ' ';
    if(comp.device !== '') device = ' d-' + comp.device.toLowerCase();
    if(comp.os !== '') os = ' os-' + comp.os.toLowerCase();
}

function getMachineInfo(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    var dev = getDeviceInfo();
    var os = getOSInfo();
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {
            browser: 'IE',
            bversion:(tem[1]||''),
            device: dev,
            os: os
        };
    }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {
            return {
                browser: 'Opera',
                bversion:tem[1],
                device: dev,
                os: os
            };
        }
    }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
        browser: M[0],
        bversion: M[1],
        device: dev,
        os: os
    };
}

function getDeviceInfo() {
    if(navigator.userAgent.match(/Android/i)) return 'Android';
    if(navigator.userAgent.match(/BlackBerry/i)) return 'BlackBerry';
    if(navigator.userAgent.match(/iPhone/i)) return 'iPhone';
    if(navigator.userAgent.match(/iPad/i)) return 'iPad';
    if(navigator.userAgent.match(/iPod/i)) return 'iPod';
    if(navigator.userAgent.match(/Opera Mini/i)) return 'OperaMini';
    if(navigator.userAgent.match(/IEMobile/i)) return 'WinMobile';
    return '';
}

function getOSInfo() {
    if (navigator.appVersion.match(/Win/i)) return 'Windows';
    if (navigator.appVersion.match(/Mac/i)) return 'iOS';
    if (navigator.appVersion.match(/X11/i)) return 'Unix';
    if (navigator.appVersion.match(/Linux/i)) return 'Linux';
    return '';
}

$(function() {
    $('html').addClass(version + 'b-' + comp.browser.toLowerCase() + os + device);
});