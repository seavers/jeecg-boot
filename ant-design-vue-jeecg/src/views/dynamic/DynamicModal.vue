<template>
  <a-modal
    :title="title"
    :columns="columns"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form"  :label-col="labelCol" :wrapper-col="wrapperCol"  :model="model" :rules="validatorRules">
        <a-form-item v-for="(item, index) in columns" :label="item.text" :key="item.value">
          <dynamic-element :item="item" :value.sync="model[item.value]"></dynamic-element>
        </a-form-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import DynamicElement from './modules/DynamicElement'

  export default {
    name: "DynamicModal",
    components: { DynamicElement },
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        layout: {
          labelCol: { span: 4 },
          wrapperCol: { span: 14 },
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 },
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
          name: [
            { required: true, message: '请输入姓名!' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
          ],
          email: [
            { required: false, type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
          ]
        },
        url: {
          add: "/online/cgform/api/form/" + this.$route.params.code,
          edit: "/online/cgform/api/form/" + this.$route.params.code
        },
      }
    },
    props: {
      "columns": {
        type: Array
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.model = Object.assign({}, record);
        // this.columns.forEach((el) => {
        //   el.val = this.model[el.value];
        // })
        this.visible = true;
      },
      close () {
        this.$refs.form.resetFields();
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
        })
      },
      handleCancel () {
        this.close()
      },

      /** 判断是否允许多选 */
      allowMultiple(item) {
        return item.rule === 'in'
      },
    }
  }
</script>

<style scoped>

</style>