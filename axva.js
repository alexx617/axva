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
function Rule(opt) {
    var chk_ = chk(opt);
    this.check = chk_[0];
    this.errMsg = chk_[1];
    this.pass = chk_[2];
    this.ruleType = opt.ruleType;
    this.ruleValue = opt.ruleValue;
    this.ruleName = opt.formName;
    if (opt.propCheck==1) {
        if (opt.errClass) { //有给错误class的话,如校验结果为false添加class
            this.errMsg ? addClass(opt.dom_,opt.errClass) : removeClass(opt.dom_, opt.errClass);
        } else { //否则默认添加错误提示dom
            this.errMsg ? appendChild(opt.dom_, chk_[1], opt.formName) : removeChild(opt.dom_, chk_[1], opt.formName);
        }
    }else if(opt.alone){
        if(aloneBox&&aloneBox.indexOf(formName)!==-1){
            this.errMsg ? addClass(dom_, errClass) : removeClass(dom_, errClass);
        }
    }
}


// 2.循环需要验证的项目
function chk(opt) {
    var vaResult = {};
    var firstErr = null;
    var pass = true;
    opt.check.forEach(item =>{
        var isPass = checkRule(item, opt.ruleType, opt.ruleValue, opt.formData);
        vaResult[item] = isPass;
        if (firstErr === null && isPass === false) {
            firstErr = getErrMsg({item, errMsg:opt.errMsg, ruleValue:opt.ruleValue, ruleType:opt.ruleType,local:opt.local});
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
function getErrMsg(opt) {
    if (opt.local === 'cn') {
        var errMsgs = {
            type: `${opt.errMsg}格式不正确`,
            noEmpty: `${opt.errMsg}不能为空`,
            max: `${opt.errMsg}不能大于${opt.ruleType[opt.item]}`,
            min: `${opt.errMsg}不能小于${opt.ruleType[opt.item]}`,
            NumMax: `${opt.errMsg}不能大于${opt.ruleType[opt.item]}`,
            NumMin: `${opt.errMsg}不能小于${opt.ruleType[opt.item]}`,
            equal: `两次输入的${opt.errMsg}不相同`,
            unequal: `两次输入的${opt.errMsg}不能相同`,
            pattern: `${opt.errMsg}${opt.ruleType.message}`,
            accepted: `${opt.errMsg}${opt.ruleType.message}`,
            other: `${opt.errMsg}${opt.ruleType.message}`,
            include: `${opt.errMsg}${opt.ruleType.message}`
        }
    } else if (opt.local === 'pt') {
        var errMsgs = {
            type: `Formato incorreto <b>${opt.errMsg}</b>`,
            noEmpty: `<b>${opt.errMsg}</b> Não pode ser vazio`,
            max: `<b>${opt.errMsg}</b> Máximo de ${opt.ruleType[opt.item]}`,
            min: `<b>${opt.errMsg}</b> Mínimo de ${opt.ruleType[opt.item]}`,
            NumMax: `<b>${opt.errMsg}</b> Máximo de ${opt.ruleType[opt.item]}`,
            NumMin: `<b>${opt.errMsg}</b> Mínimo de ${opt.ruleType[opt.item]}`,
            equal: `inserir <b>${opt.errMsg}</b> por duas vezes não é equal`,
            unequal: `inserir <b>${opt.errMsg}</b> por duas vezes não pode ser equal`,
            pattern: `<b>${opt.errMsg}</b> ${opt.ruleType.message}`,
            accepted: `<b>${opt.errMsg}</b> ${opt.ruleType.message}`,
            other: `<b>${opt.errMsg}</b> ${opt.ruleType.message}`,
            include: `<b>${opt.errMsg}</b> ${opt.ruleType.message}`
        }
    }
    return errMsgs[opt.item]
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
function va(ops) {
    let vm = ops.vnode.context //当前的vue实例
    let ruleValidate = vm.ruleValidate; //验证规则列表
    let item_form = ops.binding.expression; //model到哪个表单里
    let formData = vm[item_form]; //整个表单的key:value列表
    let formName = []; //需要验证的表单列表
    let formMsg = []; // 报错时需要显示给用户的验证项的名字列表
    let formDOM = ops.el; //获取表单DOM里面的所有表单
    let el_dom = []; //获取每一项的DOM
    let optionalRule = []; //最终整个表的验证结果
    let propCheck = 0;
    assert(formDOM, '未设置需要验证哪个表单 <form v-va="xxx"></form>')
    assert(formData, '未设置表单信息 ruleValidate:{}')
    if (formDOM.attributes["errClass"]) { //获取错误的class
        errClass = formDOM.attributes["errClass"].value;
    }
    if (formDOM.attributes["propCheck"]) {
        propCheck = formDOM.attributes["propCheck"].value;
    }
    
    for (let i = 0; i < formDOM.elements.length; i++) { //获取所有需要验证项
        let prop = formDOM.elements[i];
        if (prop.attributes["prop"]) {
            let item = prop.attributes["prop"].value.split(',');
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
            if(propCheck==0&&ops.alone_&&aloneBox.indexOf(ops.alone_)===-1){
                aloneBox.push(ops.alone_)
            }
            optionalRule[itemname] = new Rule({ruleType:rule, ruleValue:value_, errMsg:formMsg[i], check:item_, formData:formData, formName:itemname, dom_:el_dom[i],local:ops.local,propCheck:propCheck,errClass:errClass,alone_:ops.alone_});
            if (rule.split) {
                let extalItems = split(value_, rule.split, itemname);
                extalItems.forEach( (ele, index) => {
                    let _sitem = getValItem(ele.rules);
                    let extralItemIndex = findEleByName(el_dom, ele.name);
                    optionalRule[ele.name] = new Rule({ruleType:ele.rules, ruleValue:ele.value, errMsg:formMsg[extralItemIndex], check:_sitem, formData:formData, formName:ele.name, dom_:el_dom[extralItemIndex],local:ops.local,propCheck:propCheck,errClass:errClass});
                });
            }
        }
    }
    // console.log(optionalRule)
    vm[item_form + '_valid'] = optionalRule;
    let firstErr = null;
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


let aloneBox = [];//为blur时保存当前离焦元素

MyPlugin.install =  (Vue, local = 'cn') => {
    Vue.directive('va', {
        bind(el, binding, vnode, oldVnode) {
            va({el,binding, vnode, oldVnode,local});
        },
        componentUpdated(el, binding, vnode, oldVnode) {
            va({el,binding, vnode, oldVnode,local});
        }
    }),
    Vue.prototype.$axva = () => {
        return validate;
    }
    Vue.prototype.$axva_blur = alone => {//可设置离焦校验,需要每个input设置一个离焦并触发这个事件传入input的Name
        va({alone});
    }
}

module.exports = MyPlugin;