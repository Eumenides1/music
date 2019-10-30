// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },
  //引入外部样式
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.setData({
        modalShow: false
      })
    },
  }
})
