<template>
  <div  class="w-100 h-100 justify-content-center">
    <table class="table grey-table table-striped text-align-center size-chart-view"
           v-if="size_chart && size_chart != null && size_chart != '' && size_chart.columns"
           :class="{ invisible: !size_chart }">
      <thead>
      <tr>
        <th v-if="product_data && product_data.stock_qty && Object.keys(product_data.stock_qty).length > 0"
          scope="col" class="text-align-center">{{ $t("qty") }} </th>
        <th scope="col" class="text-align-center">{{ $t("size") }}</th>
        <th scope="col" class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][0]">{{ $t(columnsPerType[size_chart.type][0]) }} </th>
        <th scope="col" class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][1]">{{ $t(columnsPerType[size_chart.type][1]) }} </th>
        <th scope="col" class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][2]">{{ $t(columnsPerType[size_chart.type][2]) }} </th>
        <th scope="col" class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][3]">{{ $t(columnsPerType[size_chart.type][3]) }} </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="size in size_chart.columns">
        <th v-if="product_data && product_data.stock_qty && Object.keys(product_data.stock_qty).length > 0"
            class="text-align-center" scope="row">{{getSizeQuantity(size.size_name)}}</th>
        <th class="text-align-center" scope="row">{{size.size_name}}</th>
        <td class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][0]">{{size.bust}} cm</td>
        <td class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][1]">{{size.waist}} cm</td>
        <td class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][2]">{{size.hip}} cm</td>
        <td class="text-align-center" v-if="columnsPerType[size_chart.type] && columnsPerType[size_chart.type][3]">{{size.length}} cm</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    name: 'size-chart-table',
    components: {
    },
    props: {
      size_chart: [String, Number,  Array, Object],
      product_data: [String, Number,  Array, Object]
    },
    data(){
      return{
        genders:{},
        types:{},
        columnsPerType:{},
        sizeChartLabel:{},
      }
    },
    created(){
      this.setSizeChartTypes()

      if (this.size_chart)
        this.setSizeChartMobileLabels(this.size_chart.type)
    },
    computed: {
    },
    methods: {
      getSizeChartTypes() {
        let size_chart_types = {
          genders: {"male":'Male',"female":'Female',"unisex":'Unisex'},
          types: {"tops":'Tops',"bottoms":'Bottoms',"overalls":'Overalls',"shoes":'Shoes'},
          columnsPerType: {
            "tops": ['bust', 'waist', 'length'],
            "bottoms": ['waist', 'hip', 'length'],
            "overalls": ['bust', 'waist', 'hip', 'length'],
            "shoes": ['length', 'platform', 'heel']
          }
        }
        console.log('getSizeChartTypes', size_chart_types)
        return size_chart_types
      },
      getSizeChartMobileLabels(type) {
        let $i18n = this
        let size_chart_types = this.getSizeChartTypes()
        let sizeChartLabel = {
          '--label-0': `"${$i18n.$t("sizeName")}"`
        }
        console.log('getSizeChartMobileLabels size_chart_types.columnsPerType[type]', size_chart_types.columnsPerType[type])

        if (size_chart_types.columnsPerType && size_chart_types.columnsPerType[type]) {
          for (let i = 1; i <= size_chart_types.columnsPerType[type].length; i++){
            sizeChartLabel['--label-'+i] = `"${$i18n.$t(size_chart_types.columnsPerType[type][i-1])}"`
          }
        }
        console.log('getSizeChartMobileLabels', sizeChartLabel)
        return sizeChartLabel
      },
      setSizeChartTypes () {
        let size_chart_types = this.getSizeChartTypes()
        this.genders = size_chart_types.genders
        this.types = size_chart_types.types
        this.columnsPerType = size_chart_types.columnsPerType
      },
      setSizeChartMobileLabels (size_chart_type) {
        this.sizeChartLabel = this.getSizeChartMobileLabels(size_chart_type)
      },
      getSizeQuantity (size_name){
        return this.product_data && this.product_data.stock_qty && this.product_data.stock_qty[size_name] ? this.product_data.stock_qty[size_name] : 0
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
