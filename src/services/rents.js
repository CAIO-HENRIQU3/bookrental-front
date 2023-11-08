import { http } from "./config";

export default {
  list: () => {
    return http.get("rentals");
  },
  save: (rent) => {
    return http.post("rentals", rent);
  },
  update:(id)=>{
		return http.put(`rentals/giveback/${id}`);
  },
  getTotalByStatus:()=> {
		return http.get(`rentals/totalByStatus`)
	}
};