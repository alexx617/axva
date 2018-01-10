// 给错误的dom添加错误class
function addClass(dom, errClass) {
    var hasClass = !!dom.className.match(errClass);
    if (!hasClass) {
        dom.className += ' ' + errClass;
    }
}
// 检验正确后去除错误class
function removeClass(dom, errClass) {
    var hasClass = !!dom.className.match(errClass);
    if (hasClass) {
        dom.className = dom.className.replace(errClass, '');
    }
}

// 没给class的话默认显示错误DOM,检验错误的话添加DOM
function appendChild(dom, errMsg, formName) {
    var hasClass = !!dom.className.match('axva-' + formName)
    if (!hasClass) {
        dom.className += 'axva-' + formName;
        var p = document.createElement("p");
        p.innerHTML = errMsg;
        p.setAttribute('class', 'axva-err');
        dom.parentNode.insertBefore(p, dom.nextSibling);
    }
}
// 没给class的话默认显示错误DOM,检验正确的话去掉DOM
function removeChild(dom, errMsg, formName) {
    var hasClass = !!dom.className.match('axva-' + formName)
    if (hasClass) {
        var p = document.getElementsByClassName('axva-' + formName + '-err')[0];
        dom.className = dom.className.replace('axva-' + formName, '');
        dom.parentNode.removeChild(p);
    }
}

//常用正则
var regList = {
    ImgCode: /^[0-9a-zA-Z]{4}$/, //图片验证码是否4位数
    SmsCode: /^\d{4}$/, //短信验证码是否4位数字
    MailCode: /^\d{4}$/, //邮件验证码是否4位数字
    UserName: /^[\w|\d]{4,16}$/, //用户名4-16位
    Password: /^[\w!@#$%^&*.]{6,16}$/, //密码6-16位
    Mobile: /^1[3|4|5|7|8]\d{9}$/, //手机号格式
    RealName: /^[\u4e00-\u9fa5|·]{2,16}$|^[a-zA-Z|\s]{2,20}$/, //用户名格式
    BankNum: /^\d{10,19}$/, //银行卡号码格式
    Money: /^([1-9]\d*|[0-9]\d*\.\d{1,2}|0)$/,
    Answer: /^\S+$/, //非空白字符
    Mail: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, //邮箱格式
    Number: /^\d+$/, //必须数字
}

// 4.检测 检测非空
function noEmpty(value) {
    return value.toString().trim() ? true : false
}
//检测最大值length
function max(value, rule) {
    return value.length <= rule ? true : false;
}
//检测最小值length
function min(value, rule) {
    return value.length >= rule ? true : false;
}
//检测最大数值
function NumMax(value, rule) {
    return Number(value) <= Number(rule) ? true : false;
}
//检测最小数值
function NumMin(value, rule) {
    return Number(value) >= Number(rule) ? true : false;
}
//检测正则
function type(value, rule) {
    return regList[rule].test(value) ? true : false
}
//检测相等
function equal(value, rule, ruleType, formData) {
    return value === formData[rule] ? true : false
}
//检测不相等
function unequal(value, rule, ruleType, formData) {
    return value !== formData[rule] ? true : false
}
//检测自定义正则
function pattern(value, rule, ruleType, formData) {
    return rule.test(value) ? true : false
}
//检测自定义规则
function other(value, rule, ruleType, formData) {
    return rule(value) ? true : false
}
//检测必须选择
function accepted(value, rule, ruleType, formData) {
    return value ? true : false
}
//检测是否包含
function include(value, rule, ruleType, formData) {
    let list = rule[0];
    let type = rule[1];
    if (formData[type]) {
        return list[formData[type]].includes(value) ? true : false
    }
}

// 断言函数
function assert(condition, message) {
    if (!condition) {
        console.error('[axva-warn]:' + message)
    }
}

// 1.Rule构造器(最后发给form的结果) ruleType:用户给的规则 ruleValue:值 errMsg:错误信息 check:需要验证的项目
// formData:整个表信息
function Rule(ruleType, ruleValue, errMsg, check, formData, formName, dom_) {
    var chk_ = chk(check, ruleType, ruleValue, errMsg, formData, formName);
    this.check = chk_[0];
    this.errMsg = chk_[1];
    this.pass = chk_[2];
    this.ruleType = ruleType;
    this.ruleValue = ruleValue;
    this.ruleName = formName;
    if (propCheck==='true') {
        if (errClass) { //有给错误class的话,如校验结果为false添加class
            this.errMsg ? addClass(dom_, errClass) : removeClass(dom_, errClass);
        } else { //否则默认添加错误提示dom
            this.errMsg ? appendChild(dom_, chk_[1], formName) : removeChild(dom_, chk_[1], formName);
        }
    }else if(alone){
        if(alone&&alone.indexOf(formName)!==-1){
            this.errMsg ? addClass(dom_, errClass) : removeClass(dom_, errClass);
        }
    }
}


// 2.循环需要验证的项目
function chk(check, ruleType, ruleValue, errMsg, formData, formName) {
    var vaResult = {};
    var firstErr = null;
    var pass = true;
    check.forEach(function (item) {
        var isPass = checkRule(item, ruleType, ruleValue, formData);
        vaResult[item] = isPass;
        if (firstErr === null && isPass === false) {
            firstErr = getErrMsg(item, errMsg, ruleValue, ruleType);
            pass = false;
        }
    })
    return [vaResult, firstErr, pass] //各个项目是否通过,和第一个错误的报错信息,结果返回给1
}

//3.验证每一项
function checkRule(item, ruleType, ruleValue, formData) {
    var ruleCheckers = { //这里添加验证规则
        type,
        noEmpty,
        min,
        max,
        NumMax,
        NumMin,
        equal,
        unequal,
        pattern,
        accepted,
        other,
        include
    }
    if (item !== 'message') {
        var checker = ruleCheckers[item];
        var isPass = !checker || checker(ruleValue, ruleType[item], ruleType, formData, item); //这里开始校验
    }
    return isPass //是否通过,结果返回给2
}

// 5.获得不同的报错信息
function getErrMsg(item, errMsg, ruleValue, ruleType) {
    if (local === 'cn') {
        var errMsgs = {
            type: `${errMsg}格式不正确`,
            noEmpty: `${errMsg}不能为空`,
            max: `${errMsg}不能大于${ruleType[item]}`,
            min: `${errMsg}不能小于${ruleType[item]}`,
            NumMax: `${errMsg}不能大于${ruleType[item]}`,
            NumMin: `${errMsg}不能小于${ruleType[item]}`,
            equal: `两次输入的${errMsg}不相同`,
            unequal: `两次输入的${errMsg}不能相同`,
            pattern: `${errMsg}${ruleType.message}`,
            accepted: `${errMsg}${ruleType.message}`,
            other: `${errMsg}${ruleType.message}`,
            include: `${errMsg}${ruleType.message}`
        }
    } else if (local === 'pt') {
        var errMsgs = {
            type: `Formato incorreto <b>${errMsg}</b>`,
            noEmpty: `<b>${errMsg}</b> Não pode ser vazio`,
            max: `<b>${errMsg}</b> Máximo de ${ruleType[item]}`,
            min: `<b>${errMsg}</b> Mínimo de ${ruleType[item]}`,
            NumMax: `<b>${errMsg}</b> Máximo de ${ruleType[item]}`,
            NumMin: `<b>${errMsg}</b> Mínimo de ${ruleType[item]}`,
            equal: `inserir <b>${errMsg}</b> por duas vezes não é equal`,
            unequal: `inserir <b>${errMsg}</b> por duas vezes não pode ser equal`,
            pattern: `<b>${errMsg}</b> ${ruleType.message}`,
            accepted: `<b>${errMsg}</b> ${ruleType.message}`,
            other: `<b>${errMsg}</b> ${ruleType.message}`,
            include: `<b>${errMsg}</b> ${ruleType.message}`
        }
    }
    return errMsgs[item]
}

function getValItem(rule) {
    var item_ = []; //每个验证项需要去校验的规则数组列表["noEmpty", "min", "max"]
    for (let j in rule) {
        item_.push(j)
    }
    return item_;
}

function findEleByName(elements, filter) {
    let result;
    for (let i = 0; i < elements.length; i++) { //获取所有需要验证项
        var prop = elements[i];
        if (filter === prop.name) {
            result = i;
            break;
        }
    }
    return result;
}

function split(value, rule, item) {
    // _v 以rule指定格式的切割形式将value切割成数组
    let splitChar = rule.splitChar || '';
    let _v = value.split(splitChar); //value切成数组
    let res = [];
    for (let i in rule.splits) {
        let s = rule.splits[i]; //当前循环项的验证规则
        let _va = '';
        if (_v && _v.length > 0 && _v[s.index - 1]) {
            _va = _v[s.index - 1];
        }
        res.push({
            value: _va, //每项的value
            name: item + '.' + i,
            rules: s
        })
    }
    return res;
}
function va(alone_) {
    var vm = vnode_.context //当前的vue实例
    var ruleValidate = vm.ruleValidate; //验证规则列表
    var item_form = binding_.expression; //model到哪个表单里
    var formData = vm[item_form]; //整个表单的key:value列表
    var formName = []; //需要验证的表单列表
    var formMsg = []; // 报错时需要显示给用户的验证项的名字列表
    var formDOM = el_; //获取表单DOM里面的所有表单
    var el_dom = []; //获取每一项的DOM
    var optionalRule = []; //最终整个表的验证结果
    assert(formDOM, '未设置需要验证哪个表单 <form v-va="xxx"></form>')
    assert(formData, '未设置表单信息 ruleValidate:{}')
    if (formDOM.attributes["errClass"]) { //获取错误的class
        errClass = formDOM.attributes["errClass"].value;
    }
    if (formDOM.attributes["propCheck"]) {
        propCheck = formDOM.attributes["propCheck"].value;
    }
    for (let i = 0; i < formDOM.elements.length; i++) { //获取所有需要验证项
        var prop = formDOM.elements[i];
        if (prop.attributes["prop"]) {
            var item = prop.attributes["prop"].value.split(',');
            formName.push(item[0]);
            formMsg.push(item[1]);
            el_dom.push(prop)
        }
    }
    // formName 验证项列表 formData 整个表单的key:value列表 ruleValidate 验证规则列表 rule 各验证项规则
    // value_ 验证项的value值 item_ 每个验证项需要去校验的规则数组列表["noEmpty", "min", "max"] itemname
    // 当前循环的这个验证项的名称
    for (let i = 0; i < formName.length; i++) {
        let itemname = formName[i];
        let rule = ruleValidate[itemname];
        if (rule) {
            let value_ = '';
            if (rule && formData[itemname] != null) {
                value_ = formData[itemname];
            }
            let item_ = getValItem(rule);
            if(propCheck==='false'&&alone_&&alone.indexOf(alone_)===-1){
                alone.push(alone_)
            }
            optionalRule[itemname] = new Rule(rule, value_, formMsg[i], item_, formData, itemname, el_dom[i]);
            if (rule.split) {
                let extalItems = split(value_, rule.split, itemname);
                extalItems.forEach(function (ele, index) {
                    let _sitem = getValItem(ele.rules);
                    let extralItemIndex = findEleByName(el_dom, ele.name);
                    optionalRule[ele.name] = new Rule(ele.rules, ele.value, formMsg[extralItemIndex], _sitem, formData, ele.name, el_dom[extralItemIndex]);
                });
            }
        }
    }
    // console.log(optionalRule)
    vm[item_form + '_valid'] = optionalRule;
    var firstErr = null;
    for (let i in optionalRule) {
        if (firstErr === null && optionalRule[i].pass === false) {
            validate.validate = false;
            validate.errMsg = optionalRule[i].errMsg;
            firstErr = optionalRule[i].errMsg;
            break;
        } else {
            validate.validate = true;
            validate.errMsg = '';
        }
    }
}

var MyPlugin = {};
var errClass = ''; //错误提示的class
var validate = {
    validate: '',
    errMsg: null
}; //最终结果
var el_;
var binding_;
var vnode_;
var oldVnode_;
var local;
var propCheck = 'true';
var alone = [];//为blur时保存当前离焦元素

MyPlugin.install = function (Vue, options = 'cn') {
    local = options;
    Vue.directive('va', {
        bind(el, binding, vnode, oldVnode) {
            el_ = el;
            binding_ = binding;
            vnode_ = vnode;
            oldVnode_ = oldVnode;
            va();
        },
        componentUpdated(el, binding, vnode, oldVnode) {
            el_ = el;
            binding_ = binding;
            vnode_ = vnode;
            oldVnode_ = oldVnode;
            va();
        }
    }),
    Vue.prototype.$axva = function () {
        return validate;
    }
    Vue.prototype.$axva_blur = function (name) {//可设置离焦校验,需要每个input设置一个离焦并触发这个事件传入input的Name
        va(name);
    }
}

module.exports = MyPlugin;