# Vue表单验证插件

Vue.use(axva,'pt'); //第二个参数接收设置报错语言(默认是中文)

```
<form v-va='form' errClass='err' :propCheck="propCheck">
    <input type="email" v-model="form.email" prop="email,Email" placeholder="Email" autofocus/>
</form>

data(){
    return {
        ruleValidate:{
            email: {noEmpty: true,min:8,type:'Number'},
        },
        propCheck: 'false',
    }
}
isPass() {
    this.propCheck = 'true';
    var isPass = this.$axva();
    if (!isPass.validate) {
        this.$tip(isPass.errMsg);
    } else {
        this.getAjax();
    }
},
```

errClass:设置错误提示的class,设置后会添加自定义的class,如果不设置,默认是往下添加错误的DOM

propCheck:设置校验方式,设置后点击确认按钮后才验证整个表单,如果不设置,默认是一进入就验证表单

prop:('需要验证的项目字段名','显示的报错项目名称')

this.$axva():返回验证结果


检测非空: noEmpty: true,

检测最大值length: min: 2

检测最小值length: max: 16

检测最大数值: NumMax:100

检测最小数值: NumMin:1

检测是否包含:'city': { include: [citysList, 'province'], message: '该省份没有包含此城市' },//include接收两个参数,第一个是规则,第二个是查找哪个,需要加message

检测自定义规则:cpf: { other: checkcpf, message: 'cpf错误' },//other接收一个参数,自定的规则,需要加message

检测是否相等:password: { noEmpty: true, equal: 'password_again', min: 6 },

            password_again: { noEmpty: true, equal: 'password', min: 6 },

检测是否不相等:'name': { unequal: 'name2' },//unequal接收一个参数,需要对比的值

检测必须选择:service: { accepted: 'service', message: '必须接受协议' },//accepted接收一个参数,需要加message

检测检测正则:'email': { type: "Mail", max: 50 },

包含的正则包含:

ImgCode//图片验证码是否4位数

SmsCode//短信验证码是否4位数字

MailCode//邮件验证码是否4位数字

UserName//用户名4-16位格式

Password//密码6-16位格式

Mobile//手机号码格式

RealName//用户名格式

BankNum//银行卡号码格式

Answer//非空白字符

Mail//邮箱格式

Number//必须数字


