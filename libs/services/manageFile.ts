import api from "@/libs/hooks/api/api";

export const manageFile = {
  uploadFile: (req: FormData) =>
    api.post(`/files/upload`, req, {
      headers: {
        "Content-Type": "multipart/form-data",
        accept: "application/json",
      },
    }),
};
