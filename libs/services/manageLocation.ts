import api from "../hooks/api/api";
import { CreateShippingAddressPayload } from "../types/location";

const manageLocation = {
  getShippingAddresses: () => api.get("/location/addresses"),
  getShippingAddressById: (addressId: string) => api.get(`/location/address/${addressId}`),
  createShippingAddress: (data: CreateShippingAddressPayload) =>
    api.post("/location/address", data),
  updateShippingAddress: (addressId: string, data: CreateShippingAddressPayload) =>
    api.put(`/location/address/${addressId}`, data),
  deleteShippingAddress: (addressId: string) => api.delete(`/location/address/${addressId}`),
  setDefaultAddress: (addressId: string) => api.patch(`/location/address/${addressId}/default`),
  getProvincesByGHN: () => api.get("/location/provinces"),
  getDistrictsByGHNFromProvince: (provinceId: number) =>
    api.get(`/location/districts/${provinceId}`),
  getWardsByGHNFromDistrict: (districtId: number) => api.get(`/location/wards/${districtId}`),
};

export default manageLocation;
