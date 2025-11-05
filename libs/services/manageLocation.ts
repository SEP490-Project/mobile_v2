import api from "../hooks/api/api";
import { CreateShippingAddressPayload } from "../types/location";

const manageLocation = {
  getShippingAddresses: () => api.get("/location/addresses"),
  createShippingAddress: (data: CreateShippingAddressPayload) =>
    api.post("/location/address", data),
  setDefaultAddress: (addressId: string) => api.patch(`/location/address/${addressId}/default`),
  getProvincesByGHN: () => api.get("/location/provinces"),
  getDistrictsByGHNFromProvince: (provinceId: number) =>
    api.get(`/location/districts/${provinceId}`),
  getWardsByGHNFromDistrict: (districtId: number) => api.get(`/location/wards/${districtId}`),
};

export default manageLocation;
