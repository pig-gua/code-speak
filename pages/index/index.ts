import { getLearningLibraryIds, libraryCatalog } from '../../utils/library-data'

Page({
  data: {
    progress: 35, continueId: 'frontend', continueName: '前端开发核心词汇', continueLearned: 28, continueTotal: 80,
    totalLearned: 70, totalMastered: 46, libraries: libraryCatalog.filter((item) => ['frontend', 'basic'].includes(item.id))
  },
  onShow() {
    const selectedIds = getLearningLibraryIds()
    const libraries = libraryCatalog.filter((item) => selectedIds.includes(item.id))
    const current = libraries.find((item) => item.learned > 0) || libraries[0] || libraryCatalog[0]
    this.setData({
      libraries, continueId: current.id, continueName: `${current.name}核心词汇`, continueLearned: current.learned,
      continueTotal: current.total, progress: current.progress,
      totalLearned: libraries.reduce((total, item) => total + item.learned, 0),
      totalMastered: libraries.reduce((total, item) => total + item.mastered, 0)
    })
  },
  startLearning(event: { currentTarget: { dataset: { id?: string } } }) {
    const library = event.currentTarget.dataset.id || this.data.continueId
    tt.navigateTo({ url: `/pages/study/study?library=${library}` })
  },
  openLibraries() { tt.switchTab({ url: '/pages/library/library' }) },
  playAudio() { tt.showToast({ title: '发音演示：API', icon: 'none' }) }
})
