//app.js
var QQMapWX = require('/libs/qqmap-wx-jssdk.js');
App({
  
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this
    // 登录
    wx.login({
      success:function(res) {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        
        if (res.code) {
          console.log("code:  " + res.code)
          console.log(getApp().globalData.serverUrl + "/weixin/weixinInfo")
          //发起网络请求
          wx.request({
            url: getApp().globalData.serverUrl + "/weixin/weixinInfo",
            data:{
              code:res.code
            },
            header: {
              'content-type': 'json'
            },
            success: function (res) {
              console.log(res.data.object)
              var openId = res.data.object.openid //返回openid
              getApp().globalData.openId = openId
              getApp().globalData.userIfo = res.data.object
              console.log("userIfo:" + getApp().globalData.userIfo)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userIfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    
  },
  getLocal:function(e){
    var that = this
    return new Promise(function (resolve, reject){
      var qqmapsdk = that.globalData.qqmapsdk
      var longitude
      var latitude
      wx.getLocation({
        success: function (res) {
            longitude = res.longitude
            latitude = res.latitude
            qqmapsdk.reverseGeocoder({
              lacation: {
                latitude: latitude,
                longitude: longitude
              },
              success: function (res) {
                that.globalData.province = res.result.address_component.province
                that.globalData.city = res.result.address_component.city
                that.globalData.district = res.result.address_component.district
                console.log(that.globalData.province)
                resolve(res);
              },
              fail: function (res) {
                that.globalData.city = "定位失败"
                reject(res)
              }
            })
        }
      })
    })
  },
  globalData: {
    userIfo: null,
    //serverUrl: "http://yfz.tunnel.echomod.cn/",
    //serverUrl:"https://www.haofangyisou.top/",
    serverUrl:"http://127.0.0.1:8080/",
    openId:null,
    upload_url: "pawq2zntb.bkt.clouddn.com/",
    qqMapJdkKey: "3RXBZ-KJ6KW-ZG2RA-ODSIU-ASWZQ-NYB6Z",
    province:null, //省
    city:null,     //市
    district:null, //区
    qqmapsdk : new QQMapWX({
      key: '3RXBZ-KJ6KW-ZG2RA-ODSIU-ASWZQ-NYB6Z'
    }),//腾讯地图sdk
    pageSize:5
  }
})