type DictionaryWord = { word: string; phonetic: string; meaning: string; fullName?: string; category: string }
type InputEvent = { detail: { value: string } }
type WordEvent = { currentTarget: { dataset: { word: string } } }

const dictionaryWords: DictionaryWord[] = [
  { word: 'API', phonetic: '/ˌeɪ piː ˈeɪ/', fullName: 'Application Programming Interface', meaning: '应用程序编程接口', category: '编程基础' },
  { word: 'Algorithm', phonetic: '/ˈælɡərɪðəm/', meaning: '算法；运算法则', category: '编程基础' },
  { word: 'Cache', phonetic: '/kæʃ/', meaning: '缓存；高速缓冲存储器', category: '后端开发' },
  { word: 'DOM', phonetic: '/dɒm/', fullName: 'Document Object Model', meaning: '文档对象模型', category: '前端开发' },
  { word: 'Framework', phonetic: '/ˈfreɪmwɜːrk/', meaning: '框架；构架', category: '前端开发' },
  { word: 'SDK', phonetic: '/ˌes diː ˈkeɪ/', fullName: 'Software Development Kit', meaning: '软件开发工具包', category: '编程基础' }
]

Page({
  data: {
    query: '', results: [] as DictionaryWord[], selectedWord: null as DictionaryWord | null, searched: false,
    history: ['API', 'Cache', 'Framework'], hotWords: dictionaryWords.slice(0, 3), reviewWords: [] as string[], addedToReview: false
  },

  onShow() {
    const history = tt.getStorageSync('codespeak_search_history')
    const reviewWords = tt.getStorageSync('codespeak_review_words')
    const savedReviewWords = Array.isArray(reviewWords) ? reviewWords : []
    this.setData({
      history: Array.isArray(history) && history.length > 0 ? history : ['API', 'Cache', 'Framework'],
      reviewWords: savedReviewWords,
      addedToReview: this.data.selectedWord ? savedReviewWords.includes(this.data.selectedWord.word) : false
    })
  },

  handleInput(event: InputEvent) {
    const query = event.detail.value
    const normalized = query.trim().toLowerCase()
    const results = normalized ? dictionaryWords.filter((item) => `${item.word} ${item.fullName || ''}`.toLowerCase().includes(normalized)) : []
    this.setData({ query, results, searched: Boolean(normalized), selectedWord: null })
  },

  recordHistory(word: string) {
    const history = [word, ...this.data.history.filter((item) => item !== word)].slice(0, 6)
    this.setData({ history })
    tt.setStorageSync('codespeak_search_history', history)
  },

  handleConfirm() { if (this.data.query.trim()) this.recordHistory(this.data.query.trim()) },
  clearSearch() { this.setData({ query: '', results: [], searched: false, selectedWord: null }) },
  backToResults() { this.setData({ selectedWord: null }) },

  selectWord(event: WordEvent) {
    const selectedWord = dictionaryWords.find((item) => item.word === event.currentTarget.dataset.word)
    if (selectedWord) {
      this.recordHistory(selectedWord.word)
      this.setData({ selectedWord, addedToReview: this.data.reviewWords.includes(selectedWord.word) })
    }
  },

  searchHistory(event: WordEvent) { this.handleInput({ detail: { value: event.currentTarget.dataset.word } }) },
  playAudio() { if (this.data.selectedWord) tt.showToast({ title: `发音演示：${this.data.selectedWord.word}`, icon: 'none' }) },

  addReview() {
    const selectedWord = this.data.selectedWord
    if (!selectedWord || this.data.addedToReview) return
    const reviewWords = [...this.data.reviewWords, selectedWord.word]
    tt.setStorageSync('codespeak_review_words', reviewWords)
    this.setData({ reviewWords, addedToReview: true })
    tt.showToast({ title: '已加入复习', icon: 'success' })
  }
})
