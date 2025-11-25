import { useAuth } from "@/libs/hooks/useAuthen";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export function withAuthGuard<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const GuardedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (isReady && !loading && !isAuthenticated) {
        router.replace("/(auth)");
      }
    }, [isAuthenticated, loading, router, isReady]);

    if (!isReady || loading) {
      return (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#ff9fb2" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return null;
    }
    return <WrappedComponent {...(props as P)} />;
  };

  GuardedComponent.displayName = `WithAuthGuard(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return GuardedComponent;
}
