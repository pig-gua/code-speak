import { ApiWord, getStudyWords, showRequestError, submitStudySession } from '../../utils/api'
import { playWordAudio } from '../../utils/audio'

type StudyTouch = { touches: Array<{ clientX?: number; x?: number }> }
type StudyResult = { wordId: number; status: 'known' | 'review' }

let startX = 0
let currentOffset = 0

function readTouchX(event: StudyTouch) {
  const touch = event.touches[0]
  return touch.clientX ?? touch.x ?? 0
}

Page({
  data: {
    libraryId: 0,
    libraryName: '',
    words: [] as ApiWord[],
    currentWord: null as ApiWord | null,
    currentIndex: 0,
    displayIndex: 1,
    progress: 0,
    offsetX: 0,
    rotation: 0,
    swipeHint: '',
    known: 0,
    review: 0,
    results: [] as StudyResult[],
    finished: false,
    transitioning: false
  },

  onLoad(query: { library?: string }) {
    getStudyWords(query.library || 'basic').then(({ library, words }) => {
      if (words.length === 0) throw new Error('该词库暂未收录单词')
      this.setData({ libraryId: library.id, libraryName: library.name, words, currentWord: words[0] })
      tt.setNavigationBarTitle({ title: library.name })
      if (tt.getStorageSync('codespeak_autoplay')) this.playAudio()
    }).catch((error) => showRequestError(error))
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
    if (Math.abs(currentOffset) >= 80) this.markWord(currentOffset > 0 ? 'known' : 'review')
    else {
      currentOffset = 0
      this.setData({ offsetX: 0, rotation: 0, swipeHint: '' })
    }
  },

  markKnown() { this.markWord('known') },
  markReview() { this.markWord('review') },

  markWord(status: 'known' | 'review') {
    const currentWord = this.data.currentWord
    if (!currentWord || this.data.transitioning || this.data.finished) return
    this.setData({ transitioning: true, offsetX: status === 'known' ? 420 : -420, swipeHint: status })
    setTimeout(() => {
      const nextIndex = this.data.currentIndex + 1
      const finished = nextIndex >= this.data.words.length
      const safeIndex = Math.min(nextIndex, this.data.words.length - 1)
      const results = [...this.data.results, { wordId: currentWord.id, status }]
      currentOffset = 0
      this.setData({
        currentIndex: safeIndex,
        currentWord: this.data.words[safeIndex],
        displayIndex: Math.min(nextIndex + 1, this.data.words.length),
        known: this.data.known + (status === 'known' ? 1 : 0),
        review: this.data.review + (status === 'review' ? 1 : 0),
        results,
        progress: Math.round((nextIndex / this.data.words.length) * 100),
        finished,
        offsetX: 0,
        rotation: 0,
        swipeHint: '',
        transitioning: false
      })
      if (finished) submitStudySession(this.data.libraryId, results).catch(showRequestError)
      else if (tt.getStorageSync('codespeak_autoplay')) this.playAudio()
    }, 180)
  },

  playAudio() {
    if (this.data.currentWord) playWordAudio(this.data.currentWord)
  },

  restart() {
    currentOffset = 0
    this.setData({ currentIndex: 0, currentWord: this.data.words[0], displayIndex: 1, progress: 0, offsetX: 0, rotation: 0, swipeHint: '', known: 0, review: 0, results: [], finished: false, transitioning: false })
  },

  goHome() { tt.switchTab({ url: '/pages/index/index' }) }
})
