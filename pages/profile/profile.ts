import { getProfile, logout, saveAutoplay, showRequestError } from '../../utils/api'

Page({
  data: { autoplay: false, libraryCount: 0, totalLearned: 0, totalMastered: 0, streakDays: 0 },

  onShow() {
    getProfile().then((profile) => {
      this.setData({
        autoplay: profile.autoplay,
        libraryCount: profile.libraryCount,
        totalLearned: profile.totalLearned,
        totalMastered: profile.totalMastered,
        streakDays: profile.streakDays
      })
      tt.setStorageSync('codespeak_autoplay', profile.autoplay)
    }).catch(showRequestError)
  },
  openLibraries() { tt.switchTab({ url: '/pages/library/library' }) },
  openPreferences() { tt.navigateTo({ url: '/pages/onboarding/onboarding?mode=edit' }) },
  toggleAutoplay(event: { detail: { value: boolean } }) {
    const previous = this.data.autoplay
    const autoplay = event.detail.value
    this.setData({ autoplay })
    saveAutoplay(autoplay).then(() => tt.setStorageSync('codespeak_autoplay', autoplay)).catch((error) => {
      this.setData({ autoplay: previous })
      showRequestError(error)
    })
  },
  showPrivacy() {
    tt.showModal({ title: '隐私说明', content: '昵称和头像由抖音直接展示，后端不会保存；学习偏好和学习记录仅用于提供词汇学习服务，不会用于其他用途。', showCancel: false, confirmText: '我知道了' })
  },
  logout() {
    tt.showModal({
      title: '退出登录', content: '学习偏好和进度会保留在你的账号中，确定退出吗？', confirmText: '退出',
      success: (result) => {
        if (!result.confirm) return
        logout().catch(showRequestError).finally(() => {
          tt.removeStorageSync('codespeak_session')
          tt.removeStorageSync('codespeak_token')
          tt.reLaunch({ url: '/pages/splash/splash' })
        })
      }
    })
  }
})
