import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => { // 注册实例
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal) // 注册路由实例
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) { // 设置根路由-根组件实例
        this._routerRoot = this // 将_routerRoot指向根组件
        this._router = this.$options.router // 将router对象挂载到根组件元素_router上
        this._router.init(this)
        // 劫持数据_route，一旦_route数据发生变化后，通知router-view执行render方法
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else { // 非根组件设置
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  // 通过Vue.prototype定义$router、$route 属性（方便所有组件可以获取这两个属性）
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // Vue上注册router-link和router-view两个组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  // 对路由钩子使用相同的钩子合并策略
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
