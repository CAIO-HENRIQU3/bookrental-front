<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" class="gradientbackground" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"><img src="../src/assets/library-logo.svg" class="lib-logo"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.to" link>
          <v-list-item-icon>
            <v-icon color="#FFFF">{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title class="sla">{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="#272727" app>
      <v-app-bar-nav-icon @click="toggleMenu" dark></v-app-bar-nav-icon>

      <v-toolbar-title class="sla"></v-toolbar-title>
    </v-app-bar>

    <v-main class="main-container">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,

    items: [
      { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
      { title: "Editoras", icon: "mdi-book-account", to: "/Editoras" },
      { title: "Usuários", icon: "mdi-account", to: "/Usuarios" },
      { title: "Livros", icon: "mdi-book-open-blank-variant", to: "/Livros" },
      { title: "Aluguéis", icon: "mdi-book-clock", to: "/Alugueis" },
    ],
    right: null,
  }),
  methods: {
    toggleMenu() {
      this.drawer = !this.drawer;
    },
  },
};
</script>

<style>
.gradientbackground{
  background: linear-gradient(180deg, rgba(39,39,39,1) 100%, rgb(190, 190, 190) 100%)
}
.sla {
  color: white;
}
.lib-logo{
  width: 100%;
  height: 100%;
}
</style>
