export const notificationService = {
  /**
   * Placeholder abstraction for registering FCM Token once VAPID key & Service Worker are configured.
   */
  async requestNotificationPermission(): Promise<string | null> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return 'fcm_demo_token_prepared';
      }
      return null;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return null;
    }
  },

  /**
   * Play browser alert audio or vibration for high/critical notifications safely.
   */
  triggerInAppAlertSound(severity: 'critical' | 'high' | 'medium' | 'low') {
    if (severity === 'critical' || severity === 'high') {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }
  },

  pushAlert(title: string, message: string, type = 'info') {
    return {
      id: Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
};

export const NotificationService = notificationService;
