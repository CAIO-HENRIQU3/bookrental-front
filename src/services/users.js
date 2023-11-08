import { http } from "./config";

export default {
  list: () => {
    return http.get("users");
  },
  save: (user) => {
    return http.post("users", user);
  },
  update:(user)=>{
		return http.put('users',user);
  },
  delete:(userId)=>{
		return http.delete(`users/${userId}`)
	}
};
