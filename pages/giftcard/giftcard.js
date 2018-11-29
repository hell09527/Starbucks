// pages/giftcard/giftcard.js
var api_url = 'http://www.easy-mock.com/mock/5975f0fda1d30433d83c2272/giftcard/list';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    giftList:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad: function(options) {
     var that = this;
     wx.request({
       url: api_url+options.id, //仅为示例，并非真实的接口地址
       data: {},
       header: {
         'content-type': 'json'
       },
       success: function(res) {
         that.setData({
           giftList:res.data
         });
       }
     })

   },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '礼品卡详情'
    })
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
