import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useNotification = () => {
  const { loading, notifications, loadingMore, pagination } = useSelector(
    (state: RootState) => state.manageNotification,
  );

  return {
    loading,
    notifications,
    loadingMore,
    pagination,
  };
};
