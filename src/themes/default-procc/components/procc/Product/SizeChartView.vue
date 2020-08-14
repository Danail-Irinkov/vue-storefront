<template>
  <div  class="pt-1 pb-1 w-100 h-100 justify-content-center" style="z-index: 999"
        @click.stop.prevent="">
    <div class="w-100 h-auto" >
      <div v-if="size_chart_loading" style="min-height: 10rem">
        <label class="margin-auto mt-4"
               style="padding-top: 15%!important;"
               :animation-duration="4000"
               :dot-size="16"
               :dots-num="4"
               color="#23CCEF"
        />
      </div>
      <div class="col-12" v-else>
        <size-chart-table class="table grey-table table-striped text-align-center size-chart-view"
                          :size_chart="size_chart"
                          :product_data="product_data"
                          v-if="size_chart && size_chart.columns">
        </size-chart-table>
        <div v-else class="text-center no-data">
          <strong>{{$t("noData")}}</strong>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import SizeChartTable from './SizeChartTable.vue'
  import _ from 'lodash'

  export default {
    name: 'size-chart-view',
    components: {
      SizeChartTable
    },
    props: {
      product: [String, Number,  Array, Object],
    },
    data(){
      return{
        product_data: {},
        size_chart: {},
        size_chart_loading: true,
      }
    },
    created(){
      this.getSizeChart();
    },
    methods: {
      getSizeQuantity (size_name){
        return this.product_data && this.product_data.available_quantity && this.product_data.available_quantity[size_name] ? this.product_data.available_quantity[size_name] : 0
      },
      async getSizeChart (){
        try {
        this.size_chart_loading = true
        console.log('this.product', this.product)
        if(this.product && this.product.product){
          this.product_data = _.cloneDeep(this.product)
          if (this.product.product && _.isObject(this.product.product)){
            if(this.product.product._id){
              this.product_data._id = this.product.product._id
            }
            if(this.product.product.vendor_images && this.product.product.vendor_images[0] && this.product.product.vendor_images[0].thumb){
              this.product_data.vendor_images = this.product.product.vendor_images
            }
            if (this.product.product.available_quantity) {
              this.product_data.available_quantity = this.product.product.available_quantity
            }
            if(this.product.product && this.product.product.size_chart){
              this.product_data.size_chart = this.product.product.size_chart
            }
          }else{
            this.product_data._id = this.product.product
          }
        }else{
          this.product_data =  _.cloneDeep(this.product)
        }

        let result = await this.ProCcAPI.getVSFSizeChartById(this.$props.product.size_chart_id, this.$props.product.procc_brand_id) // product id
        this.size_chart = !_.isNull(result.data.sizeChart) ? result.data.sizeChart : {}
        this.$nextTick(() => { this.size_chart_loading = false })
      } catch (e) {
        console.log('getSizeChart Error', e)
      }
    }
  },
  watch: {
    product (newProduct, oldProduct) {
      // added condition for check id product is same then not call API for get size chart
      if (newProduct.procc_product_id !== oldProduct.procc_product_id) { this.getSizeChart() }
    }
  }
}
</script>
<style lang="scss">
.no-data{
  line-height: 60px;
}
  @media screen and (max-width: 767px) {
    .size-chart-view thead {display: block;}
    .size-chart-view thead tr th, .size-chart-view tbody tr th, .size-chart-view tbody tr td {padding: 12px 4px !important;    font-size: 13px;}
    .size-chart-view thead tr th:nth-child(1), .size-chart-view thead tr th:nth-child(2),
    .size-chart-view tbody tr th:nth-child(1), .size-chart-view tbody tr th:nth-child(2) {width: 13.16% !important;display: table-cell;
      float: left;}
    .size-chart-view thead tr th:nth-child(3), .size-chart-view thead tr th:nth-child(5), .size-chart-view thead tr th:nth-child(4),
    .size-chart-view tbody tr td:nth-child(3), .size-chart-view tbody tr td:nth-child(5), .size-chart-view tbody tr td:nth-child(4){width: 17.16% !important;display: table-cell;
      float: left;}
    .size-chart-view thead tr th:nth-child(6), .size-chart-view tbody tr td:nth-child(6){width: 19.16% !important;display: table-cell;
      float: left;}
    .size-chart-view tbody {display: inline;}
  }
@media screen and (max-width: 374px) {
  .el-dialog__wrapper .size-chart-modal {    width: 100% !important;}
}
</style>
