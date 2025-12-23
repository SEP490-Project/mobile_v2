import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useTermPolicy = () => {
  const { loading, privacyPolicy, termOfService } = useSelector(
    (state: RootState) => state.manageTermPolicy,
  );

  return {
    loading,
    privacyPolicy,
    termOfService,
  };
};
