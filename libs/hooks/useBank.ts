import type { RootState } from "@/libs/stores";
import { useSelector } from "react-redux";

export const useBank = () => {
  const { loading, bank } = useSelector((state: RootState) => state.manageBank);
  return { loading, bank };
};
