import { getLearningLibraryIds, libraryCatalog, saveLearningLibraryIds } from '../../utils/library-data'

type LibraryEvent = { currentTarget: { dataset: { id: string } } }

Page({
  data: { learning: libraryCatalog.slice(0, 2), recommended: libraryCatalog.slice(2, 4) },
  onShow() {
    const selectedIds = getLearningLibraryIds()
    this.setData({ learning: libraryCatalog.filter((item) => selectedIds.includes(item.id)), recommended: libraryCatalog.filter((item) => !selectedIds.includes(item.id)) })
  },
  startLearning(event: LibraryEvent) {
    tt.navigateTo({ url: `/pages/study/study?library=${event.currentTarget.dataset.id}` })
  },
  addLibrary(event: LibraryEvent) {
    const id = event.currentTarget.dataset.id
    const library = libraryCatalog.find((item) => item.id === id)
    if (!library) return
    const selectedIds = Array.from(new Set([...getLearningLibraryIds(), id]))
    saveLearningLibraryIds(selectedIds)
    this.setData({ learning: libraryCatalog.filter((item) => selectedIds.includes(item.id)), recommended: libraryCatalog.filter((item) => !selectedIds.includes(item.id)) })
    tt.showToast({ title: `已添加${library.name}`, icon: 'success' })
  }
})
