Page({
  data: {
    loading: false
  },

  handleLogin() {
    if (this.data.loading) {
      return
    }

    this.setData({ loading: true })

    tt.login({
      force: true,
      success: (response) => {
        console.log(response.code)
        tt.setStorageSync('codespeak_session', true)
        const completedOnboarding = Boolean(tt.getStorageSync('codespeak_onboarded'))
        setTimeout(() => {
          if (completedOnboarding) {
            tt.switchTab({ url: '/pages/index/index' })
          } else {
            tt.redirectTo({ url: '/pages/onboarding/onboarding' })
          }
        }, 3000)
      },
      fail: () => {
        this.setData({ loading: false })
        tt.showToast({
          title: '登录未完成，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})
