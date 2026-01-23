import axios from "axios";

export const manageBank = {
  bankList: () => axios.get("https://api.vietqr.io/v2/banks"),
};
