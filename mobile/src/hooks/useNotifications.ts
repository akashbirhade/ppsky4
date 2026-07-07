import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Handle foreground notification
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification tap
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync();
    // Send token to backend for push notifications
    console.log('Push token:', token.data);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  };

  const handleNotificationNavigation = (data: any) => {
    // Navigate based on notification type
    switch (data?.type) {
      case 'MATCH':
      case 'LIKE':
      case 'SUPER_LIKE':
        // Navigate to matches
        break;
      case 'MESSAGE':
        // Navigate to chat
        break;
      case 'CALL':
        // Navigate to call screen
        break;
      case 'PROFILE_VIEW':
        // Navigate to views
        break;
    }
  };

  return { registerForPushNotifications };
};
