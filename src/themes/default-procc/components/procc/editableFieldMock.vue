<template>
    <div :style="fieldStyle" :class="className" :id="fieldId" style="display: inline-block">
      {{ inputValue }}
    </div>
</template>

<script>
  // import { mixin as clickaway } from 'vue-clickaway'

  export default {
    name: "editable-field-mock",
    // mixins: [ clickaway ],
    components: {

    },
      props: ['inputValue','enable','dottedMode','textAreaMode','className','fieldId', 'fieldStyle', 'inputStyle', 'selectOptions','databaseDropdown'],
        data() {
            return {
                newValue: null,
                editing: false
            }
        },
        mounted(){
        },
        computed: {
          wrapperStyle(){
            return this.fieldStyle + ';max-width: 80px'
          }
        },
        methods: {
            enableEditing: function (mouseEvent) {
                if(this.enable) {
                    this.newValue = this.inputValue
                    this.editing = true
                }
            },
            disableEditing: function () {
                this.newValue = null;
                this.editing = false;
            },
            saveEdit: function () {
                this.$emit('input', this.newValue)
                this.disableEditing();
            }
        }
    }
</script>

<style>

    span.underlined {
        border-bottom: dotted #2a778c 2px;
    }
    .editable-field {
        position: relative;
        min-width: 60px;
        margin: 0;
    }
    .editable-field .action-btn button.btn.btn-outline {
        padding: 4px;
        margin: 0;
        background-color: #fff;
        width: 50%;
        float: left;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
    .editable-field .form-group.display-inline-block input {
        height: 30px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-color: #48ccee;
        border-bottom-color: transparent;
        text-align: center;
    }
    .editable-field .form-group.display-inline-block {
        margin: 0;
    }
    .editable-field .action-btn button.btn.btn-outline.left-btn {
        margin: 0;
        color: #48ccee;
        border-color: #48ccee;
        border-bottom-right-radius: 0;
    }

    .editable-field .action-btn button.btn.btn-outline.right-btn {
        border-bottom-left-radius: 0;
        color: #48ccee;
        border-color: #48ccee;
        width: calc(50%);
    }
.ef-button{
  max-height: 20px;
  margin-left: 0px!important;
}
.ef-button > .fa{
  position: relative;
  top: -5px;
}
</style>
