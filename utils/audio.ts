import { apiOrigin } from './api'

type AudioContext = ReturnType<typeof tt.createInnerAudioContext>

let activeAudio: AudioContext | null = null

function releaseAudio(context: AudioContext) {
  if (activeAudio !== context) return
  context.destroy()
  activeAudio = null
}

export function playWordAudio(word: { id: number; word: string }) {
  if (activeAudio) {
    activeAudio.stop()
    activeAudio.destroy()
  }

  const context = tt.createInnerAudioContext()
  activeAudio = context
  context.src = `${apiOrigin}/audio/words/${word.id}.mp3`
  context.obeyMuteSwitch = false
  context.onEnded(() => releaseAudio(context))
  context.onError(() => {
    releaseAudio(context)
    tt.showToast({ title: `${word.word} 发音加载失败`, icon: 'none' })
  })
  context.play()
}
