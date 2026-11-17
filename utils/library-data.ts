export type LibraryRecord = {
  id: string
  name: string
  description: string
  symbol: string
  learned: number
  total: number
  mastered: number
  progress: number
}

const storageKey = 'codespeak_library_ids'

export const libraryCatalog: LibraryRecord[] = [
  { id: 'basic', name: '编程基础', description: '每位开发者的共同语言', symbol: 'DEV', learned: 42, total: 120, mastered: 27, progress: 35 },
  { id: 'frontend', name: '前端开发', description: '构建用户界面的核心术语', symbol: 'FE', learned: 28, total: 80, mastered: 19, progress: 35 },
  { id: 'backend', name: '后端开发', description: '服务端、接口与中间件', symbol: 'BE', learned: 0, total: 96, mastered: 0, progress: 0 },
  { id: 'database', name: '数据库', description: '查询、索引与数据存储', symbol: 'DB', learned: 0, total: 64, mastered: 0, progress: 0 },
  { id: 'cloud', name: '云计算', description: '部署、容器与云服务', symbol: 'CL', learned: 0, total: 72, mastered: 0, progress: 0 },
  { id: 'ai', name: '人工智能', description: '模型、训练与神经网络', symbol: 'AI', learned: 0, total: 88, mastered: 0, progress: 0 }
]

export function getStoredLibraryIds(): string[] {
  const value = tt.getStorageSync(storageKey)
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function getLearningLibraryIds(): string[] {
  const selectedIds = getStoredLibraryIds()
  return selectedIds.length > 0 ? selectedIds : ['frontend', 'basic']
}

export function saveLearningLibraryIds(ids: string[]) {
  tt.setStorageSync(storageKey, ids)
}

export function getLibraryById(id: string) {
  return libraryCatalog.find((item) => item.id === id)
}
