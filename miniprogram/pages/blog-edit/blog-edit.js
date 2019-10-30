// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footBottom:0,
    images:[],
    selectPhoto:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
  },

  onInput(event){
    console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    if(wordsNum>= MAX_WORDS_NUM){
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  //获取焦点
  onFocus(event) {
    this.setData({
      footBottom: event.detail.height
    })
  },
  // 失去焦点
  onBlur() {
    this.setData({
      footBottom: 0
    })
  },
  //选择图片
  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        //还能再选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  //删除图片
  onDeleteImg(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    let max = MAX_IMG_NUM - this.data.images.length
    this.setData({
      images: this.data.images,
      selectPhoto: max <= 0 ? false : true
    })
  },
  //图片预览
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  send(){
    //判断内容是否为空
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      //产生一个蒙板  其他区域不能被点击
      mask: true
    })
    //  数据 -> 云数据库
    //  2、数据库：内容、图片fileID、openID、昵称、头像、时间
    //  1、图片：上传到云存储 返回FileID 云文件ID
    let promiseArr = []
    let fileIds = []
    //图片上传
    for(let i=0,len=this.data.images.length;i<len;i++){
      let p = new Promise((resolve,reject)=>{
        let item = this.data.images[i]
        //文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    //存入云数据库
    Promise.all(promiseArr).then((res)=>{
      db.collection('blog').add({
        data:{
          //...表示取到userInfo里面的每一个属性
          ...userInfo,
          content,
          images: fileIds,
          //openid会自己传进去
          createTime: db.serverDate(), //服务端的时间
        }
      }).then((res)=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        //返回博客界面，并刷新
        wx.navigateBack()

        const pages = getCurrentPages()
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh()

      })
    }).catch((err)=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})