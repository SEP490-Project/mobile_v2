import { useAuth } from "@/libs/hooks/useAuthen";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export function withAuthGuard<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const GuardedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace("/(auth)");
      }
    }, [isAuthenticated, loading]);

    if (loading) {
      return (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...(props as P)} />;
  };

  // Đặt display name giúp debug dễ hơn
  GuardedComponent.displayName = `WithAuthGuard(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return GuardedComponent;
}
