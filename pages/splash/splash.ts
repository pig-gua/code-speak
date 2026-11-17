import { login, showRequestError } from '../../utils/api'

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
        const startedAt = Date.now()
        login(response.code).then((result) => {
          tt.setStorageSync('codespeak_token', result.token)
          tt.setStorageSync('codespeak_session', true)
          tt.setStorageSync('codespeak_onboarded', result.onboarded)
          tt.setStorageSync('codespeak_autoplay', result.user.autoplay)
          const remaining = Math.max(0, 3000 - (Date.now() - startedAt))
          setTimeout(() => {
            if (result.onboarded) tt.switchTab({ url: '/pages/index/index' })
            else tt.redirectTo({ url: '/pages/onboarding/onboarding' })
          }, remaining)
        }).catch((error) => {
          this.setData({ loading: false })
          showRequestError(error)
        })
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
