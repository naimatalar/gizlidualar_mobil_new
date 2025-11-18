import TrackPlayer, { Event, RepeatMode } from 'react-native-track-player'

const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play())
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause())
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop())
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    TrackPlayer.seekTo(position).catch(() => null)
  })

  TrackPlayer.setRepeatMode(RepeatMode.Off).catch(() => null)
}

export default playbackService


