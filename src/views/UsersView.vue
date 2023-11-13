<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
      :search="search"
      :footer-props="footerProps"
      mobile-breakpoint="850"
    >
      <template slot="top">
        <v-toolbar flat>
          <v-col cols="5" sm="2" md="2" lg="2">
            <v-toolbar-title>Usuários</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-col>
          <v-row>
            <v-col cols="7" sm="2" md="2" lg="2">
              <v-btn color="#272727" dark class="mb-2" @click="dialog = true">
                Novo +
              </v-btn>
            </v-col>
            <v-col cols="5" sm="10" md="10" lg="10">
              <v-text-field
              class="main-search"
                v-model="search"
                append-icon="mdi-magnify"
                label="Pesquisar"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <v-dialog v-model="dialog" max-width="500px" persistent>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{
                  editedItem.id ? "Editar Usuário" : "Novo Usuário"
                }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Usuário"
                        :error-messages="fieldErrors.name"
                        @input="clearFieldError('name')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.address"
                        label="Endereço"
                        :error-messages="fieldErrors.address"
                        @input="clearFieldError('address')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.city"
                        label="Cidade"
                        :error-messages="fieldErrors.city"
                        @input="clearFieldError('city')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :error-messages="fieldErrors.email"
                        @input="clearFieldError('email')"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#272727" text @click="close"
                  >Cancelar</v-btn
                >
                <v-btn color="#272727" text @click="save">Salvar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
        <v-text-field
          class="mobile-search"
          v-model="search"
          append-icon="mdi-magnify"
          label="Pesquisar"
          single-line
          hide-details
        ></v-text-field>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-icon size="20px" color="#272727" class="mr-2" @click="showDialog(item)"
          >mdi-pencil</v-icon
        >
        <v-icon size="20px" color="#272727" class="mr-2" @click="deleteItem(item)"
          >mdi-delete</v-icon
        >
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import User from "@/services/users";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      search: "",
      headers: [
        { text: "Id", align: "start", value: "id" },
        { text: "Nome", align: "start", value: "name" },
        { text: "Endereço", value: "address" },
        { text: "Cidade", value: "city" },
        { text: "Email", value: "email" },
        { text: "Ações", value: "actions", sortable: false },
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        id: null,
        name: "",
        address: "",
        city: "",
        email: "",
      },
      fieldErrors: {},
      footerProps: {
        itemsPerPageText: "Linhas por página:",
      },
      defaultItem: {
        id: null,
        name: "",
        address: "",
        city: "",
        email: "",
      },
    };
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      User.list().then((result) => {
        this.users = result.data;
        this.sortUsers();
      });
    },
    clearFieldError(fieldName) {
      if (this.fieldErrors[fieldName]) {
        this.fieldErrors[fieldName] = [];
      }
    },
    sortUsers() {
      this.users.sort((a, b) => {
        return a.id - b.id;
      });
    },
    validateFields() {
      this.fieldErrors = {};

      if (!this.editedItem.name) {
        this.fieldErrors.name = ["Campo obrigatório"];
      }
      if (!this.editedItem.address) {
        this.fieldErrors.address = ["Campo obrigatório"];
      }
      if (!this.editedItem.city) {
        this.fieldErrors.city = ["Campo obrigatório"];
      }
      if (!this.editedItem.email) {
        this.fieldErrors.email = ["Campo obrigatório"];
      } else if (!this.validateEmailFormat(this.editedItem.email)) {
        this.fieldErrors.email = ["Insira Um E-mail Válido"];
      }

      return Object.keys(this.fieldErrors).length === 0;
    },

    validateEmailFormat(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    save() {
      const fieldsAreValid = this.validateFields();
      if (!fieldsAreValid) {
        return;
      }
      if (!this.validateEmailFormat(this.editedItem.email)) {
        this.fieldErrors.email = true;
        return;
      }
      if (!this.editedItem.id) {
        User.save(this.editedItem)
          .then(() => {
            this.dialog = false;
            this.editedItem = {};
            this.fieldErrors = {};
            Swal.fire({
              icon: "success",
              title: "Usuário Adicionado Com sucesso!",
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
            });
            this.getList();
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Erro ao Salvar Usuário",
              text: error.response.data.message,
              confirmButtonColor: "#F27474",
              allowOutsideClick: false,
            });
          });
      } else {
        this.update();
      }
    },
    update() {
      User.update(this.editedItem)
        .then(() => {
          this.dialog = false;
          this.editedItem = {};
          Swal.fire({
            icon: "success",
            title: "Usuário Atualizado com sucesso!",
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
          this.getList();
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Erro ao Editar Usuário",
            text: error.response.data.message,
            confirmButtonColor: "#F27474",
            allowOutsideClick: false,
          });
        });
    },
    showDialog(User) {
      this.editedItem = { ...User };
      this.dialog = true;
    },
    deleteItem(user) {
      Swal.fire({
        title: "Deseja Excluir o Usuário?",
        text: "Essa Ação Não Pode Ser Desfeita!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Excluir",
        confirmButtonColor: "#F8BB86",
        cancelButtonColor: "#272727",
        reverseButtons: true,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          User.delete(user.id)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Usuário Deletado Com Sucesso!",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
              this.getList();
            })
            .catch((error) => {
              Swal.fire({
                icon: "error",
                title: "Erro ao Deletar Usuário",
                text: error.response.data.message,
                confirmButtonColor: "#F27474",
                allowOutsideClick: false,
              });
            });
        }
      });
    },
    close() {
      this.dialog = false;
      this.fieldErrors = {};
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
  },
};
</script>
<style scoped>
.mobile-search {
  display: none;
}
@media screen and (max-width: 768px) {
  .mobile-search {
    display: block;
    padding: 18px;
  }
  .main-search {
    display: none;
  }
}
</style>