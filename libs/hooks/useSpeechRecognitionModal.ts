import { useCallback, useState } from "react";
import { useSpeechRecognition, type UseSpeechRecognitionOptions } from "./useSpeechRecognition";

export interface UseSpeechRecognitionModalOptions extends UseSpeechRecognitionOptions {
  onSearchSubmit?: (text: string) => void;
}

export const useSpeechRecognitionModal = (options: UseSpeechRecognitionModalOptions = {}) => {
  const { onSearchSubmit, ...speechOptions } = options;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const handleResult = useCallback(
    (text: string, isFinal?: boolean) => {
      setRecognizedText(text);

      options.onResult?.(text, isFinal);

      if (isFinal && text && onSearchSubmit) {
        setTimeout(() => {
          onSearchSubmit(text);
          setIsModalVisible(false);
          setRecognizedText("");
        }, 1000);
      }
    },
    [options.onResult, onSearchSubmit],
  );

  const handleEnd = useCallback(() => {
    options.onEnd?.();
  }, [options.onEnd]);

  const handleError = useCallback(
    (error: string) => {
      options.onError?.(error);
      setRecognizedText("");
    },
    [options.onError],
  );

  const speechRecognition = useSpeechRecognition({
    ...speechOptions,
    onResult: handleResult,
    onEnd: handleEnd,
    onError: handleError,
  });

  const showModal = useCallback(() => {
    setIsModalVisible(true);
    setRecognizedText("");
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    setRecognizedText("");
    if (speechRecognition.isRecording) {
      speechRecognition.stop();
    }
  }, [speechRecognition]);

  const startRecording = useCallback(async () => {
    setRecognizedText("");
    return await speechRecognition.start();
  }, [speechRecognition]);

  const stopRecording = useCallback(() => {
    speechRecognition.stop();
  }, [speechRecognition]);

  const useRecognizedText = useCallback(() => {
    if (recognizedText && onSearchSubmit) {
      onSearchSubmit(recognizedText);
      hideModal();
    }
  }, [recognizedText, onSearchSubmit, hideModal]);

  return {
    isModalVisible,
    recognizedText,

    isRecording: speechRecognition.isRecording,
    isAvailable: speechRecognition.isAvailable,
    hasPermission: speechRecognition.hasPermission,

    showModal,
    hideModal,
    startRecording,
    stopRecording,
    useRecognizedText,

    checkAvailability: speechRecognition.checkAvailability,
    requestPermission: speechRecognition.requestPermission,
    cleanup: speechRecognition.cleanup,
  };
};
