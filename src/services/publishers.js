import { http } from "./config";

export default {
  list: () => {
    return http.get("publishers");
  },
  save: (publisher) => {
    return http.post("publishers", publisher);
  },
  update: (publisher) => {
    return http.put("publishers", publisher);
  },
  delete: (publisherId) => {
    return http.delete(`publishers/${publisherId}`);
  },
};
