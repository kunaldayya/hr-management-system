import { defineConfig } from "orval";

export default defineConfig({
  hrApi: {
    input: "https://localhost:7169/swagger/v1/swagger.json",
    output: {
      mode: "tags-split",
      target: "src/api/generated/hrApi.ts",
      schemas: "src/api/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/lib/axios-instance.ts",
          name: "axiosInstance",
        },
      },
    },
  },
});