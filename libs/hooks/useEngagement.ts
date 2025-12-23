import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useEngagement = () => {
  const { loading, contentEngagement, userEngagementStatus } = useSelector(
    (state: RootState) => state.manageEngagement,
  );

  return {
    loading,
    contentEngagement,
    userEngagementStatus,
  };
};
