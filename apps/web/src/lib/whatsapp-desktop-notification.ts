/**
 * WhatsApp Desktop Web Notification Engine
 * Displays native OS notifications when the browser window is inactive or in the background.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

export function showDesktopNotification({
  title,
  body,
  tag,
  onClick,
}: {
  title: string;
  body: string;
  tag?: string;
  onClick?: () => void;
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: tag || 'etaxwala-whatsapp-chat',
      silent: true, // We play our synthesized WhatsApp chime directly
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (onClick) onClick();
    };

    // Auto close desktop notification after 6 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch {}
    }, 6000);
  } catch (err) {
    console.warn('Failed to display desktop notification:', err);
  }
}
