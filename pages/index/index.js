//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
  },
  //事件处理函数
  bindViewCoffeeOnMe: function() {
    wx.navigateTo({
      url: '../detail/detail'
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function () {
    let that = this;
    // that.webSiteInfo();
    let times = 0;
    let load_timer = setInterval(function () {
      times++;

      let token = app.globalData.token;
      if (token != '') {
        app.showBox(that, '登陆成功');
        that.setData({
          is_login: 1,
          maskStatus: 0
        })
        clearInterval(load_timer);
      } else if (times == 15) {
        app.showBox(that, '登录超时...');
        that.setData({
          maskStatus: 0,
          is_login: 1,
        })
        clearInterval(load_timer);
        return;
      }
    }, 1000);
  },
})
