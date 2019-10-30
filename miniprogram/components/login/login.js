// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
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
    //获取用户信息 弹出允许或者拒绝对话框
    onGetUserInfo(event) {
      console.log(event)
      const userInfo = event.detail.userInfo
      //允许授权
      if (userInfo) {
        this.setData({
          modalShow: false
        })
        this.triggerEvent('loginSuccess', userInfo)
      } else {
        //授权失败
        this.triggerEvent('loginFail')
      }
    }
  }
})
