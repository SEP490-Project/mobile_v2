import * as Notifications from "expo-notifications";
import React, { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync";

interface NotificationContextType {
  expoPushToken: string;
  notification: Notifications.Notification | null;
}

export const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: "",
  notification: null,
});

interface Props {
  children: ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log("User clicked notification:", r);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};
