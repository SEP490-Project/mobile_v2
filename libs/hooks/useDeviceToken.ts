import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useDeviceToken = () => {
  const { loading } = useSelector((state: RootState) => state.manageDeviceToken);

  return {
    loading,
  };
};
