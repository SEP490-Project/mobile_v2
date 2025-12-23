import api from "../hooks/api/api";

const manageTermPolicy = {
  privacyPolicy: () => api.get(`/configs/public/privacy-policy`),
  termOfService: () => api.get(`/configs/public/term-of-service`),
};

export default manageTermPolicy;
