import { BackHandler } from 'react-native'

// React Native 0.81 removes BackHandler.removeEventListener. Some third-party
// libraries (e.g. older react-native-paper releases) still call the legacy API.
// This lightweight polyfill maps the legacy call to the new subscription-based
// API so those libraries keep working until they are upgraded.

if (typeof BackHandler.removeEventListener !== 'function') {
  const legacySubscriptions = new Map()
  const originalAddEventListener = BackHandler.addEventListener.bind(BackHandler)

  BackHandler.addEventListener = (eventName, handler) => {
    const subscription = originalAddEventListener(eventName, handler)
    legacySubscriptions.set(handler, subscription)
    return subscription
  }

  BackHandler.removeEventListener = (eventName, handler) => {
    const subscription = legacySubscriptions.get(handler)
    if (subscription && typeof subscription.remove === 'function') {
      subscription.remove()
    }
    legacySubscriptions.delete(handler)
  }
}



