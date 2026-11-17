export type ApiLibrary = {
  id: number
  code: string
  name: string
  description: string
  symbol: string
  selected: boolean
  learned: number
  total: number
  mastered: number
  progress: number
}

export type ApiWord = {
  id: number
  libraryId: number
  word: string
  phonetic: string
  fullName?: string
  meaning: string
  example: string
}

type ApiResponse<T> = { code: number; message: string; data: T }
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const apiOrigin = 'http://127.0.0.1:8080'
const baseUrl = `${apiOrigin}/api`

export function getToken() {
  return tt.getStorageSync('codespeak_token') as string || ''
}

export function request<T>(path: string, method: RequestMethod = 'GET', data?: object, authenticated = true): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    tt.request({
      url: `${baseUrl}${path}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (response) => {
        const body = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && body && body.code === 0) {
          resolve(body.data)
          return
        }
        if (response.statusCode === 401) {
          tt.removeStorageSync('codespeak_token')
          tt.removeStorageSync('codespeak_session')
        }
        reject(new Error(body?.message || `请求失败（${response.statusCode}）`))
      },
      fail: () => reject(new Error('无法连接服务器，请确认后端服务已启动'))
    })
  })
}

export function login(code: string) {
  return request<{ token: string; onboarded: boolean; user: { autoplay: boolean } }>('/auth/login', 'POST', { code }, false)
}

export function getLibraries() { return request<ApiLibrary[]>('/libraries') }

export async function savePreferences(codes: string[]) {
  const libraries = await getLibraries()
  const libraryIds = libraries.filter((item) => codes.includes(item.code)).map((item) => item.id)
  return request<ApiLibrary[]>('/users/me/libraries', 'PUT', { libraryIds })
}

export async function addLibrary(code: string) {
  const libraries = await getLibraries()
  const selected = libraries.filter((item) => item.selected || item.code === code).map((item) => item.code)
  return savePreferences(selected)
}

export async function getStudyWords(code: string) {
  const libraries = await getLibraries()
  const library = libraries.find((item) => item.code === code)
  if (!library) throw new Error('词库不存在')
  const words = await request<ApiWord[]>(`/libraries/${library.id}/words`)
  return { library, words }
}

export function submitStudySession(libraryId: number, results: Array<{ wordId: number; status: 'known' | 'review' }>) {
  return request<{ known: number; review: number }>('/study/sessions', 'POST', { libraryId, results })
}

export function getDashboard() {
  return request<{
    continueLibrary: ApiLibrary | null
    totalLearned: number
    totalMastered: number
    streakDays: number
    dailyWord: ApiWord
    libraries: ApiLibrary[]
  }>('/dashboard')
}

export function searchDictionary(query = '') {
  return request<{ query: string; results: ApiWord[]; history: string[]; hotWords: ApiWord[] }>(`/dictionary?query=${encodeURIComponent(query)}`)
}

export function getReviewWords() { return request<{ wordIds: number[] }>('/review-words') }
export function addReviewWord(wordId: number) { return request<{ wordIds: number[] }>(`/review-words/${wordId}`, 'POST') }

export function getProfile() {
  return request<{
    nickname: string
    avatarUrl: string
    autoplay: boolean
    libraryCount: number
    totalLearned: number
    totalMastered: number
    streakDays: number
  }>('/users/me')
}

export function saveAutoplay(autoplay: boolean) {
  return request<{ autoplay: boolean }>('/users/me/settings', 'PATCH', { autoplay })
}

export function logout() { return request<void>('/auth/logout', 'POST') }

export function showRequestError(error: unknown) {
  tt.showToast({ title: error instanceof Error ? error.message : '操作失败，请稍后重试', icon: 'none', duration: 2500 })
}
