<template>
  <div style="background:#fff;min-height:600px">
    <h1>详情</h1>
    <a-spin :spinning="false">
      <a-form-model ref="form" :model="model">
        <a-row :gutter="24">
          <a-col span="12" v-for="(item, index) in columns" :key="item.value">
        <a-form-model-item :labelCol="{span:8}" :wrapperCol="{span:15}" :label="item.text">
          <dynamic-element :item="item" :value.sync="model[item.value]"></dynamic-element>
        </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </div>
</template>

<script>
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import DynamicModal from './DynamicModal'
  import DynamicElement from './modules/DynamicElement'
  import { DynamicTableListMixin } from '@/mixins/DynamicTableListMixin'

  export default {
    name: 'DynamicEdit',
    mixins: [DynamicTableListMixin],
    components: {
      DynamicModal,
      DynamicElement,
    },
    props: {
    },
    data() {
      return {
        dynamicId: this.$route.params.code,
        id: this.$route.params.id,
        columns: [],
        model: {}
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        getAction('/online/cgform/api/getFormItem/' + this.dynamicId, {}).then((res) => {
          if (res.success) {
            this.columns = this.handleGetSchema(this, res.result.schema)
          }else{
            this.$message.warning(res.message)
          }
        })
        getAction('/online/cgform/api/form/' + this.dynamicId + "/" + this.id, {}).then((res) => {
          if (res.success) {
            this.model = res.result;
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      modalFormOk() {

      }
    }
  }
  </script>