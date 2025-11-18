import TrackPlayer from 'react-native-track-player'

let _setupPromise

export async function setupTrackPlayer() {
  if (_setupPromise) {
    return _setupPromise
  }

  _setupPromise = (async () => {
    await TrackPlayer.setupPlayer({})
    await TrackPlayer.updateOptions({
      capabilities: [],
      compactCapabilities: [],
      progressUpdateEventInterval: 2,
    })
  })()

  return _setupPromise
}


