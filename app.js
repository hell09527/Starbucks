//app.js




App({

  /**
   * 全局变量
   */
  globalData: {
    siteBaseUrl: "https://store-test.91xdb.com/", //服务器url
    wx_info: null,
    encryptedData: '',
    iv: '',
    session_key: '',
    openid: '',
    token: '',
    defaultImg: {
      is_use: 0
    },
    webSiteInfo: {},
    tab_parm: '',
    tab_type: '',
    copyRight: {
      is_load: 1,
      default_logo: '',
      technical_support: '',
    },
  },

  //app初始化函数
  onLaunch: function () {
    let that = this;
    that.app_login();
    that.defaultImg();
    that.webSiteInfo();
    that.copyRightIsLoad();
  },

  onShow: function () {

  },

  //app登录
  app_login: function () {
    let that = this;
    wx.login({
      success: function (res) {
        if (that.globalData.session_key != '') {
          return false;
        }

        that.sendRequest({
          url: "api.php?s=Login/getWechatInfo",
          data: {
            code: res.code
          },
          success: function (wechat_res) {
            console.log("21312")
            let code = wechat_res.code;
            if (code == 0) {
              let wx_info = JSON.parse(wechat_res.data);
              that.setSessionKey(wx_info.session_key);
              that.setOpenid(wx_info.openid);
              that.getwechatUserInfo();
            }
            //console.log(wechat_res)
          }
        });
      }
    });
  },

  getwechatUserInfo: function () {
    let that = this;
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        wx.getUserInfo({
          success: res => {
            // 可以将 res 发送给后台解码出 unionId
            that.setWxInfo(res.rawData);
            that.setEncryptedData(res.encryptedData);
            that.setIv(res.iv);
            //wx.setStorageSync("userInfo", res.rawData);
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (this.userInfoReadyCallback) {
              this.userInfoReadyCallback(res)
            }
            that.wechatLogin(); //自动登录或注册
          }
        })
      }
    })
  },

  wechatLogin: function () {
    let that = this;
    let openid = that.globalData.openid;
    let wx_info = that.globalData.wx_info;
    let session_key = that.globalData.session_key;
    let encryptedData = that.globalData.encryptedData;
    let iv = that.globalData.iv;
    if (openid == undefined || session_key == undefined || encryptedData == undefined || iv == undefined) {
      return false;
    }
    // console.log(openid),
    that.sendRequest({
      url: "api.php?s=login/getWechatInfos",
      data: {
        openid: openid,
        wx_info: wx_info,
        sessionKey: session_key,
        encryptedData: encryptedData,
        iv: iv,
      },
      success: function (res) {
        let code = res.code;
        if (code == 0 || code == 10) {
          that.setToken(res.data.token);
        }
        // console.log(res)
      }
    });
  },

  /**
   * 封装请求函数
   */
  sendRequest: function (param, customSiteUrl) {
    let that = this;
    let data = param.data || {};
    let header = param.header;
    let requestUrl;
    data.token = that.globalData.token;

    if (param.method == '' || param.method == undefined) {
      param.method = 'POST';
    }
    if (customSiteUrl) {
      requestUrl = customSiteUrl + param.url;
    } else {
      requestUrl = this.globalData.siteBaseUrl + param.url;
    }

    if (param.method) {
      if (param.method.toLowerCase() == 'post') {
        header = header || {
          'content-type': 'application/x-www-form-urlencoded;'
        }
      } else {
        data = this._modifyPostParam(data);
      }
      param.method = param.method.toUpperCase();
    }

    if (!param.hideLoading) {
      this.showToast({
        title: '请求中...',
        icon: 'loading'
      });
    }

    wx.request({
      url: requestUrl,
      data: data,
      method: param.method || 'GET',
      header: header || {
        'content-type': 'application/json'
      },
      success: function (res) {
        //请求失败
        if (res.statusCode && res.statusCode != 200) {
          that.hideToast();
          /*that.showModal({
            content: '' + res.errMsg
          });*/
          typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
          return;
        }
        typeof param.success == 'function' && param.success(res.data);
        let code = res.data.code;
        let message = res.data.message;
        if (code == -50) {
          that.showModal({
            content: message,
            url: '/pages/index/index'
          })
        } else if (code == -10) {
          that.showModal({
            content: message,
            code: -10,
          })
        }
        //console.log(res);
      },
      fail: function (res) {
        that.hideToast();
        that.showModal({
          content: '请求失败 ' + res.errMsg,
        })
        typeof param.fail == 'function' && param.fail(res.data);
      },
      complete: function (res) {
        param.hideLoading || that.hideToast();
        typeof param.complete == 'function' && param.complete(res.data);
      }
    });
  },
  //微信提示 函数
  showToast: function (param) {
    wx.showToast({
      title: param.title,
      icon: param.icon,
      duration: param.duration || 1500,
      success: function (res) {
        typeof param.success == 'function' && param.success(res);
      },
      fail: function (res) {
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },
  //隐藏加载提示
  hideToast: function () {
    wx.hideToast();
  },
  //模态框提示
  showModal: function (param) {
    wx.showModal({
      title: param.title || '提示',
      content: param.content,
      showCancel: param.showCancel || false,
      cancelText: param.cancelText || '取消',
      cancelColor: param.cancelColor || '#000000',
      confirmText: param.confirmText || '确定',
      confirmColor: param.confirmColor || '#3CC51F',
      success: function (res) {
        if (res.confirm) {
          typeof param.confirm == 'function' && param.confirm(res);
          let pages = getCurrentPages();
          if (param.url != '' && param.url != undefined && pages.length < 2) {
            wx.switchTab({
              url: param.url,
            })
          } else if (param.code == -10) {
            wx.navigateBack({
              delta: 1
            })
          }

        } else {
          typeof param.cancel == 'function' && param.cancel(res);
        }
      },
      fail: function (res) {
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },

  _modifyPostParam: function (obj) {
    let query = '';
    let name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  },

  getSiteBaseUrl: function () {
    return this.globalData.siteBaseUrl;
  },
  setSessionKey: function (session_key) {
    this.globalData.session_key = session_key;
  },
  setOpenid: function (openid) {
    this.globalData.openid = openid;
  },
  setWxInfo: function (wx_info) {
    this.globalData.wx_info = wx_info;
  },
  setEncryptedData: function (encryptedData) {
    this.globalData.encryptedData = encryptedData;
  },
  setIv: function (iv) {
    this.globalData.iv = iv;
  },
  setToken: function (token) {
    this.globalData.token = token;
  },
  setTabParm: function (tab_parm) {
    this.globalData.tab_parm = tab_parm;
  },
  setTabType: function (tab_type) {
    this.globalData.tab_type = tab_type;
  },
  setCopyRight: function (copyRight) {
    this.globalData.copyRight = copyRight;
  },

  /**
   * 界面弹框
   */
  showBox: function (that, content, time = 1500) {
    setTimeout(function callBack() {
      that.setData({
        prompt: content
      });
    }, 200)
    setTimeout(function callBack() {
      that.setData({
        prompt: ''
      });
    }, time + 200)
  },

  /**
   * 商品、用户头像默认图
   */
  defaultImg: function () {
    let that = this;

    that.sendRequest({
      url: "api.php?s=goods/getDefaultImages",
      data: {},
      success: function (res) {
        let code = res.code;
        let data = res.data;
        if (code == 0) {
          that.globalData.defaultImg = data;
          that.globalData.defaultImg.value.default_goods_img = that.IMG(that.globalData.defaultImg.value.default_goods_img); //默认商品图处理
          that.globalData.defaultImg.value.default_headimg = that.IMG(that.globalData.defaultImg.value.default_headimg); //默认用户头像处理
        }
        console.log(res);
      }
    });
  },

  /**
   * 基础配置
   */
  webSiteInfo: function () {
    let that = this;

    that.sendRequest({
      url: "api.php?s=login/getWebSiteInfo",
      data: {},
      success: function (res) {
        let code = res.code;
        let data = res.data;
        if (code == 0) {
          that.globalData.webSiteInfo = data;
          if (data.title != '' && data.title != undefined) {
            wx.setNavigationBarTitle({
              title: data.title,
            })
          }
        }
        console.log(res);
      }
    })
  },

  /**
   * 图片路径处理
   */
  IMG: function (img) {
    let base = this.globalData.siteBaseUrl;
    img = img == undefined ? '' : img;
    img = img == 0 ? '' : img;
    if (img.indexOf('http://') == -1 && img.indexOf('https://') == -1 && img != '') {
      img = base + img;
    }
    return img;
  },

  /**
   * 底部加载
   */
  copyRightIsLoad: function (e) {
    let that = this;

    that.sendRequest({
      url: "api.php?s=task/copyRightIsLoad",
      data: {},
      success: function (res) {
        let code = res.code;
        let data = res.data;
        if (code == 0) {
          let copyRight = data;
          copyRight.technical_support = '';
          copyRight.default_logo = '/images/index/logo_copy.png';

          if (copyRight.is_load == 0) {
            let img = copyRight.bottom_info.copyright_logo;
            copyRight.default_logo = that.IMG(img);
            copyRight.technical_support = copyRight.bottom_info.copyright_companyname;
          }

          that.setCopyRight(copyRight);
        }
        console.log(res);
      }
    })
  },

  /**
   * 已点击
   */
  clicked: function (that, parm) {
    let d = {};
    d[parm] = 1;
    that.setData(d);
  },

  /**
   * 状态重置
   */
  restStatus: function (that, parm) {
    let d = {};
    d[parm] = 0;
    that.setData(d);
  },

  /**
   * 随机生成验证码
   */
  verificationCode: function (that) {
    let key = this.globalData.openid;
    this.sendRequest({
      url: 'api.php?s=index/getVertification',
      data: {
        key: key
      },
      success: function (res) {
        let code = res.code;
        let data = res.data;
        if (code == 0) {
          let str_array = data;
          let size_array = [12, 13, 14, 15, 16, 17, 18]; //字体大小
          let code = []; //验证码数组
          let count = 4; //长度
          let str = '';

          for (let i = 0; i < 4; i++) {

            let r = Math.round(Math.random() * 200); //R
            let g = Math.round(Math.random() * 200); //G
            let b = Math.round(Math.random() * 200); //B
            let a = ((Math.random() * 5 + 5) / 10).toFixed(2); //透明度
            let sign = Math.round(Math.random()); //正负号
            sign = sign == 1 ? '' : '-';
            let rotate = Math.round(Math.random() * 60); //旋转角度

            let size = size_array[Math.round(Math.random() * 6)];
            let weight = Math.round(Math.random() * 900);
            let color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ');';
            let transform = 'rotateZ(' + sign + rotate + 'deg);';

            code[i] = {};
            code[i].str = str_array[i];
            code[i].style = '';
            code[i].style += 'font-size:' + size + ';';
            code[i].style += 'font-weight:' + weight + ';';
            code[i].style += 'color:' + color + ';';
            code[i].style += '-webkit-transform:' + transform + ';';
            code[i].style += 'left:' + (i * 30) + 'px;';
            str += code[i].str;
          }
          code[0].code = str;

          that.setData({
            code: code
          })
        }
      }
    });
  }
})
// App({
//   onLaunch: function() {
//     //调用API从本地缓存中获取数据
//     var logs = wx.getStorageSync('logs') || []
//     logs.unshift(Date.now())
//     wx.setStorageSync('logs', logs)
//   },

//   getUserInfo: function(cb) {
//     var that = this
//     if (this.globalData.userInfo) {
//       typeof cb == "function" && cb(this.globalData.userInfo)
//     } else {
//       //调用登录接口
//       wx.getUserInfo({
//         withCredentials: false,
//         success: function(res) {
//           that.globalData.userInfo = res.userInfo
//           typeof cb == "function" && cb(that.globalData.userInfo)
//         }
//       })
//     }
//   },

//   globalData: {
//     userInfo: null
//   }
// })
