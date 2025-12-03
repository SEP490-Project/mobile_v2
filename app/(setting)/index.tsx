import { useAppDispatch } from "@/libs/stores";
import {
  deleteDeviceTokenThunk,
  registerDeviceTokenThunk,
} from "@/libs/stores/deviceTokenManager/thunk";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingScreen() {
  const dispatch = useAppDispatch();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      setIsCheckingPermission(true);
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === "granted");
    } catch (error) {
      console.error("Error checking notification permission:", error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleToggleNotification = async (value: boolean) => {
    if (isLoading) return;

    if (value) {
      await enableNotifications();
    } else {
      await disableNotifications();
    }
  };

  const enableNotifications = async () => {
    try {
      setIsLoading(true);

      // if (!Device.isDevice) {
      //   Alert.alert(
      //     "Not supported",
      //     "Push notifications only work on physical devices, not simulators/emulators.",
      //   );
      //   return;
      // }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission denied",
          "You need to enable notification permissions in your device settings to receive push notifications.",
        );
        setNotificationEnabled(false);
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        Alert.alert("Error", "Project ID not found.");
        return;
      }

      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      await dispatch(
        registerDeviceTokenThunk({
          token: pushTokenString,
          platform: Platform.OS.toUpperCase(),
        }),
      ).unwrap();

      setNotificationEnabled(true);
      Alert.alert("Success", "Push notifications enabled.");
    } catch (error: any) {
      console.error("Error enabling notifications:", error);
      setNotificationEnabled(false);
      Alert.alert("Error", error?.message || "Failed to enable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      setIsLoading(true);

      await dispatch(deleteDeviceTokenThunk()).unwrap();

      setNotificationEnabled(false);
      Alert.alert("Success", "Push notifications disabled.");
    } catch (error: any) {
      console.error("Error disabling notifications:", error);
      Alert.alert("Error", error?.message || "Failed to disable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-base font-semibold mb-1">Push Notifications</Text>
            <Text className="text-sm text-gray-600">
              {notificationEnabled
                ? "You will receive notifications from the app."
                : "Turn on to receive notifications from the app."}
            </Text>
          </View>

          <View className="flex-row items-center ml-4">
            {isLoading && (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginRight: 8 }} />
            )}
            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleNotification}
              disabled={isLoading || isCheckingPermission}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationEnabled ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default SettingScreen;
