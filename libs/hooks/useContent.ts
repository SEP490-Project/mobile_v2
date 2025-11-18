import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useContent = () => {
  const { loading, content, contents, pagination } = useSelector(
    (state: RootState) => state.manageContent,
  );

  return {
    loading,
    content,
    contents,
    pagination,
  };
};
