// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前秒数
let duration  = 0 //当前可取总时长
let isMoving = false//表示当前进度条是否在拖拽
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:'00:00',
      totalTime:'00:00',
    },
    movableDis:0,
    progress:0,
  },

  lifetimes:{
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //拖动进度条触发的事件
    onChange(event) {
      if (event.detail.source == 'touch') {
        this.data.progess = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    //拖动进度条结束出发的事件
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progess: this.data.progess,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progess / 100)
      isMoving = false
    },
    //获得movableAreaWidth、movableViewWidth的宽度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth, movableViewWidth)
      })
    },
    //绑定音乐播放监听
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        //概率事件 在不同的机型上面会出现不同的结果
        console.log(backgroundAudioManager.duration)
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          // console.log('onTimeUpdate')
          //当前已经播放的时间
          const currentTime = backgroundAudioManager.currentTime
          //播放的总时长
          const duration = backgroundAudioManager.duration
          //每播放一秒将当前显示的一播放时间更新 提高小程序的效率
          if (currentTime.toString().split('.')[0] != currentSec) {
            const currentTimeFormat = this._dateFormat(currentTime)
            //给movableDis设置值
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progess: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
            })
            // console.log(this.data.showTime.currentTime)
          }
          currentSec = currentTime.toString().split('.')[0]
          this.triggerEvent('timeUpdate', {
            currentTime
          })
        }
      })
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        wx.showToast({
          title: '错误' + res.errCode,
        })
      })
    },
    //设置播放的时长
    _setTime() {
      duration = backgroundAudioManager.duration
      console.log(duration)
      const durationFormat = this._dateFormat(duration)
      console.log(durationFormat)
      this.setData({
        ['showTime.totalTime']: `${durationFormat.min}:${durationFormat.sec}`
      })
    },
    //格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
