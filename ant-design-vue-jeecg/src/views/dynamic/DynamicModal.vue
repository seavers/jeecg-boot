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
            <!-- 下拉搜索 -->
            <j-search-select-tag v-if="item.type==='sel_search'" v-model="model[item.value]" :dict="getDictInfo(item)" placeholder="请选择"/>
            <!-- 下拉多选 -->
            <template v-else-if="item.type==='list_multi'">
              <j-multi-select-tag v-if="item.options" v-model="model[item.value]" :options="item.options" placeholder="请选择"/>
              <j-multi-select-tag v-else v-model="model[item.value]" :dictCode="getDictInfo(item)" placeholder="请选择"/>
            </template>

            <template v-else-if="item.dictCode">
              <template v-if="item.type === 'table-dict'">
                <j-popup
                  v-model="model[item.value]"
                  :code="item.dictTable"
                  :field="item.dictCode"
                  :orgFields="item.dictCode"
                  :destFields="item.dictCode"
                  :multi="true"
                ></j-popup>
              </template>
              <template v-else>
                <j-multi-select-tag v-show="allowMultiple(item)" v-model="model[item.value]" :dictCode="item.dictCode" placeholder="请选择"/>
                <j-dict-select-tag v-show="!allowMultiple(item)" v-model="model[item.value]" :dictCode="item.dictCode" placeholder="请选择"/>
              </template>
            </template>
            <j-popup
              v-else-if="item.type === 'popup'"
              :value="model[item.value]"
              v-bind="item.popup"
              group-id="superQuery"
              @input="(e,v)=>handleChangeJPopup(item,e,v)"
              :multi="true"/>
            <j-select-multi-user
              v-else-if="item.type === 'select-user' || item.type === 'sel_user'"
              v-model="model[item.value]"
              :buttons="false"
              :multiple="false"
              placeholder="请选择用户"
              :returnKeys="['id', item.customReturnField || 'username']"
            />
            <j-select-depart
              v-else-if="item.type === 'select-depart' || item.type === 'sel_depart'"
              v-model="model[item.value]"
              :multi="false"
              placeholder="请选择部门"
              :customReturnField="item.customReturnField || 'id'"
            />
            <a-select
              v-else-if="item.options instanceof Array"
              v-model="model[item.value]"
              :options="item.options"
              allowClear
              placeholder="请选择"
              :mode="allowMultiple(item)?'multiple':''"
            />
            <j-area-linkage v-model="model[item.value]" v-else-if="item.type==='area-linkage' || item.type==='pca'" style="width: 100%"/>
            <j-date v-else-if=" item.type=='date' " v-model="model[item.value]" placeholder="请选择日期" style="width: 100%"></j-date>
            <j-date v-else-if=" item.type=='datetime' " v-model="model[item.value]" placeholder="请选择时间" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"></j-date>
            <a-time-picker v-else-if="item.type==='time'" :value="model[item.value] ? moment(model[item.value],'HH:mm:ss') : null" format="HH:mm:ss" style="width: 100%" @change="(time,value)=>model[item.value]=value"/>
            <a-input-number v-else-if=" item.type=='int'||item.type=='number' " style="width: 100%" placeholder="请输入数值" v-model="model[item.value]"/>
            <a-select v-else-if="item.type=='switch'" placeholder="请选择" v-model="model[item.value]">
              <a-select-option value="Y">是</a-select-option>
              <a-select-option value="N">否</a-select-option>
            </a-select>
            <a-input v-else v-model="model[item.value]" placeholder="请输入值"/>
        </a-form-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'

  export default {
    name: "DynamicModal",
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