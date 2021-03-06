import Taro, { Component } from '@tarojs/taro'
import {
  View,
  Image,
  Button
} from '@tarojs/components'
import {
  connect
} from '@tarojs/redux'

import './authorization.scss'
import logo from '../../assets/img/logo1.png'


import {
  base
} from '../../constants/status';

import {
  showMessage
} from '../../util/common'

class Authorization extends Component {

  config = {
    navigationBarTitleText: '授权'
  }

  constructor() {
    super(...arguments);
    this.state = {
      text: '获取微信授权登录'
    }
  }

  confirmModal(userInfo) {
    if (!userInfo.detail.rawData || !userInfo.detail.signature) {
      Taro.showModal({
        title: '提示',
        content: '您没有授权，不能查看',
      });
      return false;
    }
    if(Taro.getStorageSync('userInfo') && Taro.getStorageSync('userInfo').nickName ) {
      Taro.switchTab({
        url: `/pages/index/index`
      });
    } else {
      // 展示登陆中加载提示
      Taro.showLoading({
        title: '登录中',
        mask: true
      });

      // 调用服务端API，获取token
      Taro.login({
        success: function (res) {
          if (res.code) {
            Taro.request({
              url: `${base}/Login`,
              method: 'POST',
              header: {
                "Content-Type": "application/json"
              },
              data: {
                code: res.code,
                rawData: userInfo.detail.rawData,
                signature: userInfo.detail.signature,
              },
              success: function (data) {
                // 获取信息成功
                if (data.statusCode === 200) {
                  setTimeout(() => {
                    Taro.hideLoading();
                    showMessage('登录成功');
                    Taro.setStorageSync('userInfo', data.data.userInfo);
                    Taro.setStorage({
                      key: 'token',
                      data: data.data.token
                    }).then(res => {
                      Taro.switchTab({
                        url: '/pages/index/index'
                      });
                    })
                  }, 1000);
                }
              },
              fail: function(err) {
                showMessage('网络异常');
              }
            })
          }
        }
      });
    }
  }

  render() {
    return (
      <View className='page'>
        <Image className='img' src={logo} />
        <Button className='page-button' 
          openType='getUserInfo'
          onGetUserInfo={this.confirmModal.bind(this)}
        >
          {this.state.text}
        </Button>
      </View>
    )
  }
}

export default Authorization;
