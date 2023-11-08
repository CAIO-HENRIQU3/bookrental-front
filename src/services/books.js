import { http } from "./config";

export default {
  list: () => {
    return http.get("books");
  },
  save: (book) => {
    return http.post("books", book);
  },
  update:(book)=> {
		return http.put('books',book);
  },
  delete:(bookId)=> {
		return http.delete(`books/${bookId}`)
	},
  getMostRentBooks:()=> {
		return http.get(`books/mostRentBooks`)
	}
};
