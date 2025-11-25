import ReduxProvider from "@/app/provider";
import { NotificationProvider } from "@/libs/context/notificationContext";
import { SessionInitializer } from "@/libs/hooks/api/sessionInitializer";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [loaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();
  const pendingPathRef = useRef<string | null>(null);
  const [triedPending, setTriedPending] = useState(false);

  useEffect(() => {
    const setupNavBar = async () => {
      await NavigationBar.setButtonStyleAsync("dark");
    };
    setupNavBar();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const path = pendingPathRef.current;
    if (!path) return;

    (async () => {
      try {
        await new Promise((res) => setTimeout(res, 300));
        router.push(path as any);
        pendingPathRef.current = null;
        setTriedPending(true);
      } catch (err) {
        setTimeout(() => {
          if (pendingPathRef.current && !triedPending) {
            try {
              router.push(pendingPathRef.current as any);
              pendingPathRef.current = null;
              setTriedPending(true);
            } catch (e) {
              console.warn("[notification] retry pending navigation failed", e);
            }
          }
        }, 500);
      }
    })();
  }, [loaded, router, triedPending]);

  const safeNavigate = useCallback(
    (path: string | null) => {
      if (!path) return;
      if (!loaded) {
        pendingPathRef.current = path;
        return;
      }
      try {
        router.push(path as any);
      } catch (err) {
        pendingPathRef.current = path;
      }
    },
    [loaded, router],
  );

  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response?.notification?.request?.content?.data ?? {};
        if (data.path) {
          safeNavigate(String(data.path));
          return;
        }
        if (data.screen) {
          const { screen, ...params } = data;
          const searchParams = new URLSearchParams(
            Object.entries(params).reduce(
              (acc, [k, v]) => {
                if (v === undefined || v === null) return acc;
                acc[k] = String(v);
                return acc;
              },
              {} as Record<string, string>,
            ),
          );
          const query = Object.keys(params).length ? "?" + searchParams.toString() : "";
          safeNavigate(`${screen}${query}`);
        }
      } catch (err) {
        console.warn("Error handling notification response", err);
      }
    });

    (async () => {
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse?.notification?.request?.content?.data ?? {};
          if (data.path) {
            pendingPathRef.current = String(data.path);
            return;
          }
          if (data.screen) {
            const { screen, ...params } = data;
            const query = Object.keys(params).length
              ? "?" +
                new URLSearchParams(
                  Object.entries(params).reduce(
                    (acc, [k, v]) => {
                      if (v === undefined || v === null) return acc;
                      acc[k] = String(v);
                      return acc;
                    },
                    {} as Record<string, string>,
                  ),
                ).toString()
              : "";
            pendingPathRef.current = `${screen}${query}`;
          }
        }
      } catch (err) {
        console.warn("Error getting last notification response", err);
      }
    })();

    return () => {
      responseListener.remove();
    };
  }, [safeNavigate]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <NotificationProvider onNavigate={(path) => safeNavigate(path)}>
          <SessionInitializer>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(product)" options={{ headerShown: false }} />
              <Stack.Screen name="(search)" options={{ headerShown: false }} />
              <Stack.Screen name="(notification)" options={{ headerShown: false }} />
              <Stack.Screen name="blog" options={{ headerShown: false }} />
              <Stack.Screen name="(cart)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(user)" options={{ headerShown: false }} />
              <Stack.Screen name="(setting)" options={{ headerShown: false }} />
              <Stack.Screen name="(general)" options={{ headerShown: false }} />
              <Stack.Screen name="(checkout)" options={{ headerShown: false }} />
              <Stack.Screen name="(order)" options={{ headerShown: false }} />
              <Stack.Screen name="(payment)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
          </SessionInitializer>
        </NotificationProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
