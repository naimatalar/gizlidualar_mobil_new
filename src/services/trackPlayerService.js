import TrackPlayer, { Capability, State } from 'react-native-track-player'

let isInitialized = false

export async function setupTrackPlayer() {
  if (isInitialized) {
    return
  }

  try {
    await TrackPlayer.setupPlayer()
    
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

    isInitialized = true
  } catch (error) {
    console.warn('TrackPlayer setup error:', error)
    throw error
  }
}

export async function addTrack(track) {
  try {
    await TrackPlayer.add(track)
  } catch (error) {
    console.warn('TrackPlayer add error:', error)
    throw error
  }
}

export async function playTrack() {
  try {
    await TrackPlayer.play()
  } catch (error) {
    console.warn('TrackPlayer play error:', error)
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

