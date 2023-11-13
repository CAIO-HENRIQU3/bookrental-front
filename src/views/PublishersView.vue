<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="publishers"
      class="elevation-1"
      :search="search"
      :footer-props="footerProps"
      mobile-breakpoint="850"
    >
      <template slot="top">
        <v-toolbar flat>
          <v-col cols="5" sm="2" md="2" lg="2">
            <v-toolbar-title class="table-title">Editoras</v-toolbar-title>
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
                  editedItem.id ? "Editar Editora" : "Nova Editora"
                }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Editora"
                        :error-messages="fieldErrors.name"
                        @input="clearFieldError('name')"
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
import Publisher from "@/services/publishers";
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
        { text: "Cidade", value: "city" },
        { text: "Ações", value: "actions", sortable: false },
      ],
      publishers: [],
      editedIndex: -1,
      editedItem: {
        id: null,
        name: "",
        city: "",
      },
      fieldErrors: {},
      footerProps: {
        itemsPerPageText: "Linhas por página:",
      },
      defaultItem: {
        id: null,
        name: "",
        city: "",
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
      Publisher.list().then((result) => {
        this.publishers = result.data;
        this.sortPublishers();
      });
    },
    clearFieldError(fieldName) {
      if (this.fieldErrors[fieldName]) {
        this.fieldErrors[fieldName] = [];
      }
    },
    sortPublishers() {
      this.publishers.sort((a, b) => {
        return a.id - b.id;
      });
    },
    validateFields() {
      this.fieldErrors = {};

      if (!this.editedItem.name) {
        this.fieldErrors.name = ["Campo obrigatório"];
      }
      if (!this.editedItem.city) {
        this.fieldErrors.city = ["Campo obrigatório"];
      }

      return Object.keys(this.fieldErrors).length === 0;
    },

    save() {
      const fieldsAreValid = this.validateFields();
      console.log(this.editedItem);
      if (!fieldsAreValid) {
        return;
      }
      if (!this.editedItem.id) {
        Publisher.save(this.editedItem)
          .then(() => {
            this.dialog = false;
            this.editedItem = {};
            this.fieldErrors = {};
            Swal.fire({
              icon: "success",
              title: "Editora Adicionada Com sucesso!",
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
              title: "Erro ao Salvar Editora",
              text: error.response.data.error,
              confirmButtonColor: "#F27474",
              allowOutsideClick: false,
            });
          });
      } else {
        this.update();
      }
    },
    update() {
      Publisher.update(this.editedItem)
        .then(() => {
          this.dialog = false;
          this.editedItem = {};
          Swal.fire({
            icon: "success",
            title: "Editora Atualizada com sucesso!",
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
            title: "Erro ao Editar Editora",
            text: error.response.data.message,
            confirmButtonColor: "#F27474",
            allowOutsideClick: false,
          });
        });
    },
    showDialog(publisher) {
      this.editedItem = { ...publisher };
      this.dialog = true;
    },
    deleteItem(publisher) {
      Swal.fire({
        title: "Deseja Excluir a Editora?",
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
          Publisher.delete(publisher.id)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Editora Deletada Com Sucesso!",
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
                title: "Erro ao Deletar Editora",
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