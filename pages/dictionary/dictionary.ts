import { addReviewWord, ApiWord, getReviewWords, searchDictionary, showRequestError } from '../../utils/api'
import { playWordAudio } from '../../utils/audio'

type InputEvent = { detail: { value: string } }
type WordEvent = { currentTarget: { dataset: { word: string } } }

let searchSequence = 0

Page({
  data: {
    query: '', results: [] as ApiWord[], selectedWord: null as ApiWord | null, searched: false,
    history: [] as string[], hotWords: [] as ApiWord[], reviewWords: [] as number[], addedToReview: false
  },

  onShow() {
    Promise.all([searchDictionary(), getReviewWords()]).then(([dictionary, review]) => {
      this.setData({
        query: '', results: [], selectedWord: null, searched: false,
        history: dictionary.history, hotWords: dictionary.hotWords,
        reviewWords: review.wordIds, addedToReview: false
      })
    }).catch(showRequestError)
  },

  handleInput(event: InputEvent) {
    const query = event.detail.value
    this.setData({ query, selectedWord: null })
    setTimeout(() => this.performSearch(query), 250)
  },

  performSearch(query: string) {
    const sequence = ++searchSequence
    searchDictionary(query).then((dictionary) => {
      if (sequence !== searchSequence) return
      this.setData({
        query: dictionary.query,
        results: dictionary.results,
        history: dictionary.history,
        hotWords: dictionary.hotWords,
        searched: Boolean(dictionary.query),
        selectedWord: null
      })
    }).catch(showRequestError)
  },

  handleConfirm() { this.performSearch(this.data.query) },
  clearSearch() {
    searchSequence++
    this.setData({ query: '', results: [], searched: false, selectedWord: null })
  },
  backToResults() { this.setData({ selectedWord: null }) },

  selectWord(event: WordEvent) {
    const word = event.currentTarget.dataset.word
    const selectedWord = [...this.data.results, ...this.data.hotWords].find((item) => item.word === word)
    if (selectedWord) this.setData({ selectedWord, addedToReview: this.data.reviewWords.includes(selectedWord.id) })
  },

  searchHistory(event: WordEvent) { this.performSearch(event.currentTarget.dataset.word) },
  playAudio() { if (this.data.selectedWord) playWordAudio(this.data.selectedWord) },

  addReview() {
    const selectedWord = this.data.selectedWord
    if (!selectedWord || this.data.addedToReview) return
    addReviewWord(selectedWord.id).then((review) => {
      this.setData({ reviewWords: review.wordIds, addedToReview: true })
      tt.showToast({ title: '已加入复习', icon: 'success' })
    }).catch(showRequestError)
  }
})
