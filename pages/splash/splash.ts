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
        setTimeout(() => {
          tt.redirectTo({
            url: '/pages/index/index'
          })
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
