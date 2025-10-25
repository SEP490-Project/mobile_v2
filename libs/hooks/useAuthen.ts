import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useAuth = () => {
  const { loading, isAuthenticated, role, user } = useSelector(
    (state: RootState) => state.manageAuthen,
  );

  return {
    loading,
    isAuthenticated,
    role,
    user,
  };
};
