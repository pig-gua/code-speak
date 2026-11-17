import { addLibrary, ApiLibrary, getLibraries, showRequestError } from '../../utils/api'

type LibraryEvent = { currentTarget: { dataset: { id: string } } }

Page({
  data: { learning: [] as ApiLibrary[], recommended: [] as ApiLibrary[] },
  onShow() { this.loadLibraries() },
  loadLibraries() {
    getLibraries().then((libraries) => {
      this.setData({ learning: libraries.filter((item) => item.selected), recommended: libraries.filter((item) => !item.selected) })
    }).catch(showRequestError)
  },
  startLearning(event: LibraryEvent) {
    tt.navigateTo({ url: `/pages/study/study?library=${event.currentTarget.dataset.id}` })
  },
  addLibrary(event: LibraryEvent) {
    const code = event.currentTarget.dataset.id
    addLibrary(code).then((libraries) => {
      this.setData({ learning: libraries.filter((item) => item.selected), recommended: libraries.filter((item) => !item.selected) })
      tt.showToast({ title: '词库已添加', icon: 'success' })
    }).catch(showRequestError)
  }
})
