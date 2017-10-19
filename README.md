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
        this.$tip(isPass.errMsg)
    } else {
        this.getAjax();
    }
},
```

errClass:设置错误提示的class,设置后会添加自定义class,如果不设置,默认是添加错误的DOM

propCheck:设置校验方式,设置后会点击确认后才验证整个表单,如果不设置,默认是一进入进验证表单

prop:('需要验证的项目','显示的报错项目名称')

this.$axva():返回验证结果

检测是否包含:'bancario.contaDesde': { include: [cities, 'bancario.uf'], message: 'Inválido' },//include接收两个参数,第一个是规则,第二个是查找哪个,需要加message

检测是否不相等:'referencias[0].nome': {unequal: 'referencias[1].nome' },//unequal接收一个参数,需要对比的值


检测自定义规则:cpf: { other: checkcpf, message: 'Inválido' },//other接收一个参数,自定的规则,需要加message
