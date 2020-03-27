<template>
  <div class="select-wrapper relative">
<!--    <v-select-->
<!--      :name="name"-->
<!--      :class="{-->
<!--        'cl-tertiary' : options.length === 0,-->
<!--        'empty': !selected-->
<!--      }"-->
<!--      :autocomplete="autocomplete"-->
<!--      @focus="$emit('focus')"-->
<!--      @blur="$emit('blur')"-->
<!--      @change="$emit('change', $event.target.value)"-->
<!--      @input="$emit('input', $event.target.value)"-->
<!--    >-->
<!--      <option disabled selected value v-if="!selected" />-->
<!--      <option-->
<!--        v-for="(option, key) in options"-->
<!--        :key="key"-->
<!--        :value="option.value"-->
<!--        v-bind="{selected: option.value === selected}"-->
<!--      >-->
<!--        {{ option.label }}-->
<!--      </option>-->
<!--    </v-select>-->
    <v-select
      v-if="remoteQueryMethod"
      :name="name"
      :id="id"
      class="w-100"
      :class="{
        'cl-tertiary' : options.length === 0,
        'empty': !selected
      }"
      @search:focus="$emit('focus')"
      @search:blur="$emit('blur')"
      @input="emit_input"
      :value="selected"
      :label="selectLabel"
      :filterable="true"
      :options="options"
      @search="onSearch">
        <template slot="no-options">
          {{ loading ? $t('Loading...') : $t('No Options') }}
        </template>
        <template slot="option" slot-scope="option">
          <div class="d-center">
            {{ option[selectLabel] }}
          </div>
        </template>
        <template slot="selected-option" slot-scope="option">
          <div class="selected d-center">
            {{ option[selectLabel] }}
          </div>
        </template>
    </v-select>
    <select
      v-else
      :name="name"
      :id="id"
      :class="{
        'cl-tertiary' : options.length === 0,
        'empty': !selected
      }"
      :autocomplete="autocomplete"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @change="$emit('change', $event.target.value)"
      @input="$emit('input', $event.target.value)"
    >
      <option disabled selected value v-if="!selected" />
      <option
        v-for="(option, key) in options"
        :key="key"
        :value="option.value"
        v-bind="{selected: option.value === selected}"
      >
        {{ option.label }}
      </option>
    </select>
    <label class="input-label">{{ placeholder }}</label>

    <ValidationMessages v-if="validations" :validations="validations" />
  </div>
</template>

<script>
import ValidationMessages from './ValidationMessages.vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';
// import "vue-select/src/scss/vue-select.scss";
import _ from 'lodash';
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'

export default {
  name: 'BaseSelect',
  components: {
    ValidationMessages,
    vSelect
  },
  mounted() {
    this.options = [...this.selectOptions]
  },
  data() {
    return {
      ProCcApi: ProCcApi(),
      options: [],
      loading: false,
    }
  },
  props: {
    id: {
      type: String,
      required: false,
      default: ''
    },
    name: {
      type: String,
      required: false,
      default: ''
    },
    valueKey: {
      type: String,
      required: false,
      default: 'value'
    },
    selectLabel: {
      type: String,
      required: false,
      default: 'label'
    },
    selectOptions: {
      type: Array,
      required: true,
      default: () => []
    },
    remoteQueryMethod: { // Added by Dan
      type: String,
      required: false,
      default: ''
    },
    remoteParentSelected: { // Added by Dan
      type: String,
      required: false,
      default: ''
    },
    selected: {
      type: String,
      required: false,
      default: ''
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    autocomplete: {
      type: String,
      required: false,
      default: ''
    },
    validations: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    has_value(){
      return !!this.selected
    }
  },
  watch: {
    selectOptions(newVal){
      this.options = newVal
    }
  },
  methods: {
    emit_input(value) {
      console.log('emit_input value', value)
      let value2 = value && value[this.valueKey] ? value[this.valueKey] : ''
      console.log('emit_input value2', value2)
      this.$emit('change', value2)
      this.$emit('input', value2)
    },
    onSearch(search, loading) {
      loading(true)
      this.remoteDataQuery(loading, search, this)
    },
    remoteDataQuery: _.debounce((loading, search, vm) => {
      vm.loading = true
      vm.ProCcApi[vm.remoteQueryMethod](vm.remoteParentSelected, search)
        .then(json => {
          console.log(vm.remoteQueryMethod+' select result data', json.data)
          let data_key = 'cities'
          if(vm.remoteQueryMethod === 'getCitiesList')
            data_key = 'cities'
          if(vm.remoteQueryMethod === 'getStreetList')
            data_key = 'streets'

          if(json.data[data_key]){
            vm.$emit('remoteResults', json.data[data_key])
            // vm.options = [...vm.options, ...json.data[data_key]]
            vm.options = _.unionBy(vm.options, json.data[data_key], vm.valueKey)
          }

          vm.loading = false
        })
        loading(false)
    }, 350)
  }
}
</script>

<style lang="scss" scoped>
  @import '~theme/css/variables/colors';
  @import '~theme/css/helpers/functions/color';
  @import '~theme/css/base/text';
  $color-tertiary: color(tertiary);
  $color-black: color(black);
  $color-puerto-rico: color(puerto-rico);
  $color-hover: color(tertiary, $colors-background);

.select-wrapper {
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 1rem;
    right: 10px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 6px 0 6px;
    border-color: $color-tertiary transparent transparent transparent;
    pointer-events: none;
  }

  select {
    @extend .h4;
    border: none;
    border-bottom: 1px solid $color-tertiary;
    width: 100%;
    -moz-appearance: none;
    -webkit-appearance: none;
    border-radius: 0;
    background-color: transparent;

    &:hover,
    &:focus {
      outline: none;
      border-color: $color-puerto-rico;
    }

    &:disabled,
    &:disabled + label {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  ::v-deep.v-select {
    height: 44px;
    /*line-height: 44px;*/
    @extend .h4;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid $color-tertiary;
    width: 100%;
    -moz-appearance: none;
    -webkit-appearance: none;
    border-radius: 0;
    background-color: transparent;

    &:hover,
    &:focus {
      outline: none;
      border-color: $color-puerto-rico;
    }

    &:disabled,
    &:disabled + label {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    & .vs__dropdown-toggle{
      border: 0;
    }
    & div > div.vs__selected-options {
      & > .vs__selected{
        padding: 5px 0 0 0;
      }
      & > input.vs__search{
        margin-top: 0px;
        padding: 10px 0 10px 0 !important;
        border: 0!important;
        width: 100%!important;
      }
    }
    & div > div.vs__actions{
      display: none!important;
    }
  }
  label {
    color: #999;
    position: absolute;
    pointer-events: none;
    user-select: none;
    top: 10px;
    left: 8px;
    transition: 0.2s ease all;
    -moz-transition: 0.2s ease all;
    -webkit-transition: 0.2s ease all;
  }
  select:focus ~ label, select:not(.empty) ~ label {
    top: -10px;
    font-size: 14px;
    color: $color-puerto-rico;
  }

  .v-select:focus ~ label.input-label, .v-select:not(.empty) ~ label.input-label {
    top: -10px;
    font-size: 14px;
    color: $color-puerto-rico;
  }
}
</style>
