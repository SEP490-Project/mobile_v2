import { useAppDispatch } from "@/libs/stores";
import { restoreSession } from "@/libs/stores/authenManager/thunk";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export const SessionInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(restoreSession());
      } finally {
        setReady(true);
      }
    };
    init();
  }, [dispatch]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  return <>{children}</>;
};
