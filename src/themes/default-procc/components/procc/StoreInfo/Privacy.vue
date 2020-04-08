<template>
  <div class="row">
    <div class="col-md-12">
      <form method="#" action="#" @submit.prevent style="padding-left: 2rem;">
        <div class="row">
          <div class="col-md-12 mb-3" style="padding-bottom: 1rem;">
            <strong class="warranty-title">
              <editable-field :enable="enableEdits" fieldStyle="font-size: 2rem;"
                              v-model="policy_data.name" :inputValue="policy_data.name"></editable-field>
            </strong>
            <!--<div class="col-md-7">-->
            <!--</div>-->
            <!--<div class="col-md-5 mt-1">-->
            <!--<label>Temporary Enable Edits switch</label>-->
            <!--<l-switch v-model="enableEdits"></l-switch>-->
            <!--</div>-->
          </div>
        </div>
        <div class="row" style="padding-left: 0.6rem" v-for="(policy, policy_key) in policy_data.policy" v-if="policy.warranty_title">
          <div class="col-md-12 mb-3" style="margin-bottom: 1rem">
            <div class="mb-2 d-block ml-1">
              <editable-field :enable="false" fieldStyle="font-size: 2rem;"
                              v-model="policy.warranty_title"
                              :inputValue="policy.warranty_title"></editable-field>
            </div>

            <div class="row mb-2 ml-2" v-if="policy.conditions && Object.keys(policy.conditions).length > 0">
              <div class="col-md-12" v-for="(opt_in_condition, opt_in_name) in policy.conditions" v-if="opt_in_name.indexOf('_array') === -1">
                <!--// Display Row withOut Editable Variables  -->
                <div class="row pb-1" v-if="policy.conditions[opt_in_name] && !policy.conditions[opt_in_name+'_array']">
                  <div class="col-1 padding-asterisk" style="max-width: 32px">
                    <!--                    <fa-icon icon="asterisk"/>-->
                    *
                  </div>
                  <div class="col-11 pl-1">
                    <editable-field :enable="false" fieldStyle="font-size: 1rem;display: inline;"
                                    v-model="policy.conditions[opt_in_name]"
                                    :inputValue="policy.conditions[opt_in_name]"></editable-field>
                  </div>
                </div>
                <!--// Display Row WITH Editable Variables  -->
                <div class="row pb-1" v-else-if="policy.conditions[opt_in_name+'_array'] && policy.conditions[opt_in_name+'_array'].length > 0">
                  <div class="col-1 padding-asterisk" style="max-width: 32px">
                    <!--                    <fa-icon icon="asterisk"/>-->
                    *
                  </div>
                  <div class="col-11 pl-1">
                    <div class="display-inline" v-for="(condition_part, str_array_key) in policy.conditions[opt_in_name+'_array']">
                      <editable-field v-if="condition_part.indexOf('{') === -1 && condition_part.indexOf('}') === -1"
                                      :enable="false" fieldStyle="font-size: 1rem;display: inline;"
                                      v-model="policy_data[policy_key].conditions[opt_in_name+'_array'][str_array_key]"
                                      :inputValue="condition_part"></editable-field>

                      <editable-field v-else-if="policy_data[policy_key][getKey(condition_part)+'_select']"
                                      :enable="enableEdits" fieldStyle="font-size: 1rem;display: inline;"
                                      :selectOptions="policy_data[policy_key][getKey(condition_part)+'_select']"
                                      v-model="policy_data[policy_key][getKey(condition_part)]"
                                      :inputValue="policy_data[policy_key][getKey(condition_part)]"></editable-field>
                      <editable-field v-else
                                      :enable="enableEdits" fieldStyle="font-size: 1rem;display: inline;"
                                      v-model="policy_data[policy_key][getKey(condition_part)]"
                                      :inputValue="policy_data[policy_key][getKey(condition_part)]"></editable-field>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import {currentStoreView} from "@vue-storefront/core/lib/multistore";
  import {mapGetters} from "vuex";
  import editableField from '../editableFieldMock.vue';

  export default {
    name: 'StorePrivacy',
    props: {
    },
    components: {
      editableField
    },
    data () {
      return {
        enableEdits: false, // Set to false by Dan for the launch
      }
    },
    mounted () {
      console.log('StorePrivacy MOUNTED!')
    },
    methods: {
      getKey(condition_part){
        return Object.keys(JSON.parse(condition_part))[0]
      },
    },
    computed: {
      ...mapGetters({
        currentStore: 'procc/getCurrentStore'
      }),
      policy_data () {
        return this.currentStore && this.currentStore.storefront_setting && this.currentStore.storefront_setting.privacy_policy ? this.currentStore.storefront_setting.privacy_policy : this.currentStoreView.privacy_policy ? this.currentStoreView.privacy_policy : {}
      },
      currentStoreView () {
        return currentStoreView()
      },
      isDefaultStore () {
        const storeView = currentStoreView();
        return storeView.storeCode === ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .col-11 {
    max-width: 90%;
  }
  .display-inline {
    display: inline;
  }
  .padding-asterisk {
    padding: 3px 0px 0px 20px;
  }
  .warranty-policy-modal {
    margin-top: 5vh!important;
    width: 100% !important;
    max-width: 850px!important;
    & > * {
      word-break: break-word;
    }
    & >>> .editable-field {
      width: 80px !important;
      margin: 0 !important;
      display: inline-block !important;
    }
    & >>> .editable-field.select-field {
      max-width: none !important;
      width: auto !important;
    }
    & >>> .warranty-title .editable-field {
      max-width: none !important;
      width: 100% !important;
    }
    & .warranty-title .editable-field .form-group.display-inline-block {
      width: 100%;
      & input {
        height: 50px;
      }
    }
  }
</style>
