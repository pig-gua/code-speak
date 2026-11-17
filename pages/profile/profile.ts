import { getLearningLibraryIds, libraryCatalog } from '../../utils/library-data'

Page({
  data: { autoplay: false, libraryCount: 2, totalLearned: 70, totalMastered: 46 },

  onShow() {
    const selectedIds = getLearningLibraryIds()
    const libraries = libraryCatalog.filter((item) => selectedIds.includes(item.id))
    this.setData({
      autoplay: Boolean(tt.getStorageSync('codespeak_autoplay')),
      libraryCount: libraries.length,
      totalLearned: libraries.reduce((total, item) => total + item.learned, 0),
      totalMastered: libraries.reduce((total, item) => total + item.mastered, 0)
    })
  },
  openLibraries() { tt.switchTab({ url: '/pages/library/library' }) },
  openPreferences() { tt.navigateTo({ url: '/pages/onboarding/onboarding?mode=edit' }) },
  toggleAutoplay(event: { detail: { value: boolean } }) {
    const autoplay = event.detail.value
    this.setData({ autoplay })
    tt.setStorageSync('codespeak_autoplay', autoplay)
  },
  showPrivacy() {
    tt.showModal({ title: '隐私说明', content: '当前演示版本仅在本机保存学习偏好和设置，不会上传个人信息或学习记录。', showCancel: false, confirmText: '我知道了' })
  },
  logout() {
    tt.showModal({
      title: '退出登录', content: '退出后仍会保留你的学习偏好，确定退出吗？', confirmText: '退出',
      success: (result) => {
        if (result.confirm) {
          tt.removeStorageSync('codespeak_session')
          tt.reLaunch({ url: '/pages/splash/splash' })
        }
      }
    })
  }
})
