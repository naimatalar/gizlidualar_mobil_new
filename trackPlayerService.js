import TrackPlayer, { Event } from 'react-native-track-player'

const service = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play())
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause())
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop()
    await TrackPlayer.reset()
  })
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    TrackPlayer.seekTo(position)
  })
}

export default service

