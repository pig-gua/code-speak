import { getLibraryById } from '../../utils/library-data'

type Word = { word: string; phonetic: string; meaning: string; fullName?: string; example: string }
type StudyTouch = { touches: Array<{ clientX?: number; x?: number }> }

const studyWords: Word[] = [
  { word: 'API', phonetic: '/ˌeɪ piː ˈeɪ/', fullName: 'Application Programming Interface', meaning: '应用程序编程接口', example: 'This API returns the user profile.' },
  { word: 'DOM', phonetic: '/dɒm/', fullName: 'Document Object Model', meaning: '文档对象模型', example: 'JavaScript can update the DOM.' },
  { word: 'CSS', phonetic: '/ˌsiː es ˈes/', fullName: 'Cascading Style Sheets', meaning: '层叠样式表', example: 'CSS controls the visual style.' },
  { word: 'Runtime', phonetic: '/ˈrʌntaɪm/', meaning: '运行时；运行环境', example: 'The runtime executes the program.' },
  { word: 'SDK', phonetic: '/ˌes diː ˈkeɪ/', fullName: 'Software Development Kit', meaning: '软件开发工具包', example: 'Install the SDK before development.' },
  { word: 'Cache', phonetic: '/kæʃ/', meaning: '缓存；高速缓冲存储器', example: 'The response is stored in cache.' }
]

let startX = 0
let currentOffset = 0

function readTouchX(event: StudyTouch) {
  const touch = event.touches[0]
  return touch.clientX ?? touch.x ?? 0
}

Page({
  data: {
    libraryName: '前端开发',
    words: studyWords,
    currentWord: studyWords[0],
    currentIndex: 0,
    displayIndex: 1,
    progress: 0,
    offsetX: 0,
    rotation: 0,
    swipeHint: '',
    known: 0,
    review: 0,
    finished: false,
    transitioning: false
  },

  onLoad(query: { library?: string }) {
    const libraryName = getLibraryById(query.library || 'frontend')?.name || '前端开发'
    this.setData({ libraryName })
    tt.setNavigationBarTitle({ title: libraryName })
    if (tt.getStorageSync('codespeak_autoplay')) this.playAudio()
  },

  handleTouchStart(event: StudyTouch) {
    if (this.data.transitioning || this.data.finished) return
    currentOffset = 0
    startX = readTouchX(event)
  },

  handleTouchMove(event: StudyTouch) {
    if (this.data.transitioning || this.data.finished) return
    currentOffset = readTouchX(event) - startX
    this.setData({
      offsetX: currentOffset,
      rotation: currentOffset / 35,
      swipeHint: currentOffset > 45 ? 'known' : currentOffset < -45 ? 'review' : ''
    })
  },

  handleTouchEnd() {
    if (this.data.transitioning || this.data.finished) return
    if (Math.abs(currentOffset) >= 80) {
      this.markWord(currentOffset > 0 ? 'known' : 'review')
    } else {
      currentOffset = 0
      this.setData({ offsetX: 0, rotation: 0, swipeHint: '' })
    }
  },

  markKnown() { this.markWord('known') },
  markReview() { this.markWord('review') },

  markWord(status: 'known' | 'review') {
    if (this.data.transitioning || this.data.finished) return
    this.setData({ transitioning: true, offsetX: status === 'known' ? 420 : -420, swipeHint: status })
    setTimeout(() => {
      const nextIndex = this.data.currentIndex + 1
      const finished = nextIndex >= this.data.words.length
      const safeIndex = Math.min(nextIndex, this.data.words.length - 1)
      currentOffset = 0
      this.setData({
        currentIndex: safeIndex,
        currentWord: this.data.words[safeIndex],
        displayIndex: Math.min(nextIndex + 1, this.data.words.length),
        known: this.data.known + (status === 'known' ? 1 : 0),
        review: this.data.review + (status === 'review' ? 1 : 0),
        progress: Math.round((nextIndex / this.data.words.length) * 100),
        finished,
        offsetX: 0,
        rotation: 0,
        swipeHint: '',
        transitioning: false
      })
      if (!finished && tt.getStorageSync('codespeak_autoplay')) this.playAudio()
    }, 180)
  },

  playAudio() {
    tt.showToast({ title: `播放：${this.data.currentWord.word}`, icon: 'none' })
  },

  restart() {
    currentOffset = 0
    this.setData({ currentIndex: 0, currentWord: studyWords[0], displayIndex: 1, progress: 0, offsetX: 0, rotation: 0, swipeHint: '', known: 0, review: 0, finished: false, transitioning: false })
  },

  goHome() { tt.switchTab({ url: '/pages/index/index' }) }
})

