<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
const DefaultLayout = () => import(/* webpackChunkName: "vsf-layout-default" */ './layouts/Default')
const EmptyLayout = () => import(/* webpackChunkName: "vsf-layout-empty" */ './layouts/Empty')
const MinimalLayout = () => import(/* webpackChunkName: "vsf-layout-minimal" */ './layouts/Minimal')

export default {
  data () {
    return {
      ordersData: []
    }
  },
  mounted () {
    this.updateCurrentStore()
    this.$bus.$on('update-theme', this.updateTheme)
  },
  methods: {
    ...mapActions({
      updateCurrentStore: 'procc/updateCurrentStore'
    }),
    updateTheme (color) {
      const app = document.getElementById('app')
      app.className = color.toLowerCase()
      document.getElementById('footer-links').className += ` ${color.toLowerCase()}`
    }
  },
  computed: {
    ...mapState({
      overlayActive: state => state.ui.overlay
    }),
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    }
  },
  beforeDestroy () {
    this.$bus.$off('update-theme', this.updateTheme)
  },
  components: {
    DefaultLayout,
    EmptyLayout,
    MinimalLayout
  }
}
</script>
<style>
  #footer-links.pink,
  #app.pink{
    background-color: #fff6fe !important;
  }
  #footer-links.grey,
  #app.grey{
    background-color: #f8f8f8 !important;
  }
  #footer-links.blue,
  #app.blue{
    background-color: #ebefff !important;
  }
</style>
