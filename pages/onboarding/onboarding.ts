import { getLibraries, savePreferences, showRequestError } from '../../utils/api'

type OptionEvent = { currentTarget: { dataset: { id: string } } }
type LibraryOption = { id: string; name: string; description: string; symbol: string; selected: boolean }

Page({
  data: { selectedIds: [] as string[], selectedCount: 0, saving: false, isEditing: false, libraries: [] as LibraryOption[] },

  onLoad(query: { mode?: string }) {
    this.setData({ isEditing: query.mode === 'edit' })
    getLibraries().then((items) => {
      const selectedIds = items.filter((item) => item.selected).map((item) => item.code)
      this.setData({
        selectedIds,
        selectedCount: selectedIds.length,
        libraries: items.map((item) => ({ id: item.code, name: item.name, description: item.description, symbol: item.symbol, selected: item.selected }))
      })
    }).catch(showRequestError)
  },

  toggleLibrary(event: OptionEvent) {
    if (this.data.saving) return
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
    savePreferences(this.data.selectedIds).then(() => {
      tt.setStorageSync('codespeak_onboarded', true)
      tt.showToast({ title: '学习偏好已保存', icon: 'success', duration: 800 })
      setTimeout(() => {
        if (this.data.isEditing) tt.navigateBack({ delta: 1 })
        else tt.switchTab({ url: '/pages/index/index' })
      }, 500)
    }).catch((error) => {
      this.setData({ saving: false })
      showRequestError(error)
    })
  }
})
