import { getStoredLibraryIds, libraryCatalog, saveLearningLibraryIds } from '../../utils/library-data'

type OptionEvent = { currentTarget: { dataset: { id: string } } }

Page({
  data: { selectedIds: [] as string[], selectedCount: 0, saving: false, isEditing: false, libraries: libraryCatalog.map((item) => ({ ...item, selected: false })) },

  onLoad(query: { mode?: string }) {
    const selectedIds = getStoredLibraryIds()
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      isEditing: query.mode === 'edit',
      libraries: libraryCatalog.map((item) => ({ ...item, selected: selectedIds.includes(item.id) }))
    })
  },

  toggleLibrary(event: OptionEvent) {
    const id = event.currentTarget.dataset.id
    const selectedIds = this.data.selectedIds.includes(id) ? this.data.selectedIds.filter((item) => item !== id) : [...this.data.selectedIds, id]
    const libraries = this.data.libraries.map((item) => ({ ...item, selected: item.id === id ? !item.selected : item.selected }))
    this.setData({ selectedIds, selectedCount: selectedIds.length, libraries })
  },

  completeSetup() {
    if (this.data.saving) return
    if (this.data.selectedCount === 0) {
      tt.showToast({ title: '请至少选择一个词库', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    saveLearningLibraryIds(this.data.selectedIds)
    tt.setStorageSync('codespeak_onboarded', true)
    tt.showToast({ title: '学习偏好已保存', icon: 'success', duration: 800 })
    setTimeout(() => {
      if (this.data.isEditing) tt.navigateBack({ delta: 1 })
      else tt.switchTab({ url: '/pages/index/index' })
    }, 500)
  }
})
