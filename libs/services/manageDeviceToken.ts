import api from "../hooks/api/api";
import { registerDeviceToken } from "../types/deviceToken";

const manageDeviceToken = {
  registerDeviceToken: (req: registerDeviceToken) => api.post("/device-tokens", req),
  deleteDeviceToken: () => api.delete("/device-tokens"),
};

export default manageDeviceToken;
