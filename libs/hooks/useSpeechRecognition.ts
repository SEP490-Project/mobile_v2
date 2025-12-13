import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionOptions,
  ExpoSpeechRecognitionResultEvent,
} from "expo-speech-recognition";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export interface UseSpeechRecognitionOptions {
  language?: string;
  onResult?: (text: string, isFinal?: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  autoStopTimeout?: number;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    language = "en-US",
    onResult,
    onEnd,
    onError,
    autoStopTimeout = 10000,
    interimResults = true,
    continuous = false,
    maxAlternatives = 1,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const manuallyStoppedRef = useRef(false);

  const checkAvailability = useCallback(async () => {
    try {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      setIsAvailable(available);
      return available;
    } catch (error) {
      console.error("Speech recognition availability check failed:", error);
      setIsAvailable(false);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(granted);

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to use voice search.",
        );
      }

      return granted;
    } catch (error) {
      console.error("Permission request failed:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  useSpeechRecognitionEvent(
    "result",
    useCallback(
      (event: ExpoSpeechRecognitionResultEvent) => {
        const result = event.results[0];
        if (result?.transcript && onResult) {
          onResult(result.transcript, event.isFinal);
        }
      },
      [onResult],
    ),
  );

  useSpeechRecognitionEvent(
    "error",
    useCallback(
      (event: ExpoSpeechRecognitionErrorEvent) => {
        if (manuallyStoppedRef.current) {
          manuallyStoppedRef.current = false;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          setIsRecording(false);
          return;
        }

        setIsRecording(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      },
      [onError],
    ),
  );

  useSpeechRecognitionEvent(
    "start",
    useCallback(() => {
      setIsRecording(true);
    }, []),
  );

  useSpeechRecognitionEvent(
    "end",
    useCallback(() => {
      setIsRecording(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (manuallyStoppedRef.current) {
        manuallyStoppedRef.current = false;
      }
      onEnd?.();
    }, [onEnd]),
  );

  const stop = useCallback(() => {
    try {
      manuallyStoppedRef.current = true;
      ExpoSpeechRecognitionModule.stop();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      setIsRecording(false);
      manuallyStoppedRef.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      const hasPermissionGranted = await requestPermission();
      if (!hasPermissionGranted) return false;

      const available = await checkAvailability();
      if (!available) {
        Alert.alert("Not Available", "Speech recognition is not available on this device.");
        return false;
      }

      const recognitionOptions: ExpoSpeechRecognitionOptions = {
        lang: language,
        interimResults,
        maxAlternatives,
        continuous,
      };

      manuallyStoppedRef.current = false;
      ExpoSpeechRecognitionModule.start(recognitionOptions);

      if (autoStopTimeout > 0) {
        timeoutRef.current = setTimeout(() => {
          manuallyStoppedRef.current = true;
          stop();
        }, autoStopTimeout) as ReturnType<typeof setTimeout>;
      }

      return true;
    } catch (error) {
      setIsRecording(false);
      const errorMessage = "Failed to start speech recognition";
      console.error("Speech recognition start error:", error);
      onError?.(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    }
  }, [
    language,
    interimResults,
    maxAlternatives,
    continuous,
    autoStopTimeout,
    requestPermission,
    checkAvailability,
    stop,
    onError,
  ]);

  const cleanup = useCallback(() => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      if (isRecording) {
        manuallyStoppedRef.current = true;
        ExpoSpeechRecognitionModule.abort();
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      setIsRecording(false);
      manuallyStoppedRef.current = false;
    }
  }, [isRecording]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    isRecording,
    isAvailable,
    hasPermission,
    start,
    stop,
    cleanup,
    checkAvailability,
    requestPermission,
  };
};
