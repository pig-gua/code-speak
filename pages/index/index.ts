import { ApiLibrary, ApiWord, getDashboard, showRequestError } from '../../utils/api'
import { playWordAudio } from '../../utils/audio'

Page({
  data: {
    progress: 0, continueId: 'basic', continueName: '编程基础核心词汇', continueLearned: 0, continueTotal: 0,
    totalLearned: 0, totalMastered: 0, streakDays: 0, libraries: [] as ApiLibrary[], dailyWord: null as ApiWord | null
  },
  onShow() {
    getDashboard().then((dashboard) => {
      const current = dashboard.continueLibrary
      this.setData({
        libraries: dashboard.libraries,
        continueId: current?.code || 'basic',
        continueName: current ? `${current.name}核心词汇` : '请选择学习词库',
        continueLearned: current?.learned || 0,
        continueTotal: current?.total || 0,
        progress: current?.progress || 0,
        totalLearned: dashboard.totalLearned,
        totalMastered: dashboard.totalMastered,
        streakDays: dashboard.streakDays,
        dailyWord: dashboard.dailyWord
      })
    }).catch(showRequestError)
  },
  startLearning(event: { currentTarget: { dataset: { id?: string } } }) {
    const library = event.currentTarget.dataset.id || this.data.continueId
    tt.navigateTo({ url: `/pages/study/study?library=${library}` })
  },
  openLibraries() { tt.switchTab({ url: '/pages/library/library' }) },
  playAudio() { if (this.data.dailyWord) playWordAudio(this.data.dailyWord) }
})
