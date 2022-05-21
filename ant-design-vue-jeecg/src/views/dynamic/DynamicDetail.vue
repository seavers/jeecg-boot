<template>
<a-card :bordered="false">
  <a-descriptions title="详情" bordered style="background:#fff;min-height:600px">
    <a-descriptions-item v-for="(item, index) in columns" :key="item.value" :label="item.text">
      {{ model[item.value] }}
    </a-descriptions-item>
  </a-descriptions>
  </a-card>
</template>

<script>
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import { DynamicTableListMixin } from '@/mixins/DynamicTableListMixin'

  export default {
    name: 'DynamicDetail',
    mixins: [DynamicTableListMixin],
    components: {
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