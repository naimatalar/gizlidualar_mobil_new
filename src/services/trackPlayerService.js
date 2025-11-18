import TrackPlayer, { Capability, State } from 'react-native-track-player'

let isInitialized = false

export async function setupTrackPlayer() {
  if (isInitialized) {
    console.log('TrackPlayer zaten initialize edilmiş')
    return
  }

  try {
    console.log('TrackPlayer.setupPlayer() çağrılıyor...')
    await TrackPlayer.setupPlayer()
    console.log('TrackPlayer.setupPlayer() başarılı')
    
    console.log('TrackPlayer.updateOptions() çağrılıyor...')
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      progressUpdateEventInterval: 500,
    })
    console.log('TrackPlayer.updateOptions() başarılı')

    isInitialized = true
    console.log('TrackPlayer başarıyla initialize edildi')
  } catch (error) {
    console.error('TrackPlayer setup error:', error)
    console.error('TrackPlayer setup error stack:', error?.stack)
    throw error
  }
}

export async function addTrack(track) {
  try {
    console.log('TrackPlayer.add() çağrılıyor, track:', track)
    await TrackPlayer.add(track)
    console.log('TrackPlayer.add() başarılı')
  } catch (error) {
    console.error('TrackPlayer add error:', error)
    console.error('TrackPlayer add error stack:', error?.stack)
    throw error
  }
}

export async function playTrack() {
  try {
    const currentState = await TrackPlayer.getState()
    console.log('playTrack() çağrılıyor, mevcut state:', currentState)
    await TrackPlayer.play()
    const newState = await TrackPlayer.getState()
    console.log('playTrack() başarılı, yeni state:', newState)
  } catch (error) {
    console.error('TrackPlayer play error:', error)
    console.error('TrackPlayer play error stack:', error?.stack)
    throw error
  }
}

export async function pauseTrack() {
  try {
    await TrackPlayer.pause()
  } catch (error) {
    console.warn('TrackPlayer pause error:', error)
    throw error
  }
}

export async function stopTrack() {
  try {
    await TrackPlayer.stop()
  } catch (error) {
    console.warn('TrackPlayer stop error:', error)
    throw error
  }
}

export async function seekTo(position) {
  try {
    await TrackPlayer.seekTo(position)
  } catch (error) {
    console.warn('TrackPlayer seek error:', error)
    throw error
  }
}

export async function getPosition() {
  try {
    return await TrackPlayer.getPosition()
  } catch (error) {
    console.warn('TrackPlayer getPosition error:', error)
    return 0
  }
}

export async function getDuration() {
  try {
    return await TrackPlayer.getDuration()
  } catch (error) {
    console.warn('TrackPlayer getDuration error:', error)
    return 0
  }
}

export async function getState() {
  try {
    return await TrackPlayer.getState()
  } catch (error) {
    console.warn('TrackPlayer getState error:', error)
    return State.None
  }
}

export async function reset() {
  try {
    await TrackPlayer.reset()
  } catch (error) {
    console.warn('TrackPlayer reset error:', error)
  }
}

export async function removeAllTracks() {
  try {
    await TrackPlayer.reset()
  } catch (error) {
    console.warn('TrackPlayer removeAllTracks error:', error)
  }
}

