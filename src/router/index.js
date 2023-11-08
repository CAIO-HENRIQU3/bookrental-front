import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/DashboardView.vue"),
  },
  {
    path: "/Usuarios",
    name: "Users",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/UsersView.vue"),
  },
  {
    path: "/Livros",
    name: "Books",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/BooksView.vue"),
  },
  {
    path: "/Editoras",
    name: "Publishers",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/PublishersView.vue"),
  },
  {
    path: "/Alugueis",
    name: "Rents",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/RentsView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
