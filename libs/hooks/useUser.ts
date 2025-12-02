import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useUser = () => {
  const { loading, error } = useSelector((state: RootState) => state.manageUser);

  return {
    loading,
    error,
  };
};
