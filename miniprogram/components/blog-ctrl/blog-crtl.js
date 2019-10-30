// components/blog-ctrl/blog-crtl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object
  },
  
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
    //当前登录组件是否显示
    loginShow:false,
    //底部弹出层是否显示
    modalShow:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success:(res)=>{
                userInfo = res.userInfo
                //显示评论弹出层
                this.setData({
                  modalShow:true
                })
              }
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },

    onloginSuccess(event){
      userInfo = event.detail
      //授权框消失
      this.setData({
        loginShow:false
      },()=>{
        this.setData({
          modalShow:true
        })
      })

    },
    onloginFail(){
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    },


    onSend(event){
      //插入数据库
      let formId = event.detail.formId
      let content = event.detail.value.content
      if(content.trim() == ''){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title:'评价中',
        mask:true,
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avataUrl:userInfo.avataUrl
        }
      }).then((res)=>{
          //推送模板消息
          //云调用
          wx.cloud.callFunction({
            name:'sendMessage',
            data:{
              content,
              formId,
              blogId:this.properties.blogId
            }
          }).then((res)=>{
            console.log(res)
          })


        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
      })
      this.setData({
        modalShow:false,
        content:'',
      })

      //父元素刷新
      this.triggerEvent('refreshCommentList')
      

    },
  }
})
