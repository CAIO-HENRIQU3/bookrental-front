<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="books"
      class="elevation-1"
      :search="search"
      :footer-props="footerProps"
      mobile-breakpoint="850"
    >
      <template slot="top">
        <v-toolbar flat>
          <v-col cols="5" sm="2" md="2" lg="2">
            <v-toolbar-title>Livros</v-toolbar-title>
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
                <span class="text-h5">
                  {{ editedItem.id ? "Editar Livro" : "Novo Livro" }}
                </span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Nome"
                        :error-messages="fieldErrors.name"
                        @input="clearFieldError('name')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.author"
                        label="Autor"
                        :error-messages="fieldErrors.author"
                        @input="clearFieldError('author')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-autocomplete
                        label="Editora"
                        v-model="editedItem.publisherId"
                        :items="publishers"
                        item-text="name"
                        item-value="id"
                        :error-messages="fieldErrors.publisherId"
                        @input="clearFieldError('publisherId')"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.releaseYear"
                        label="Lançamento"
                        :error-messages="fieldErrors.releaseYear"
                        @input="clearFieldError('releaseYear')"
                        type="number"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        v-model="editedItem.amount"
                        label="Quantidade"
                        :error-messages="fieldErrors.amount"
                        @input="clearFieldError('amount')"
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
import Book from "@/services/books";
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
        { text: "Autor", value: "author" },
        { text: "Editora", value: "publisherName" },
        { text: "Lançamento", value: "releaseYear" },
        { text: "Quantidade", value: "amount" },
        { text: "Ações", value: "actions", sortable: false },
      ],
      books: [],
      publishers: [],
      editedIndex: -1,
      editedItem: {
        id: null,
        name: "",
        author: "",
        publisherId: null,
        publisherName: "",
        releaseYear: "",
        amount: "",
      },
      fieldErrors: {},
      footerProps: {
        itemsPerPageText: "Linhas por página:",
      },
      defaultItem: {
        id: null,
        name: "",
        author: "",
        publisherId: null,
        publisherName: "",
        releaseYear: "",
        amount: "",
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
    this.loadPublishers();
  },
  methods: {
    getList() {
      Book.list().then((result) => {
        this.books = result.data;
        this.sortBooks();
      });
    },
    clearFieldError(fieldName) {
      if (this.fieldErrors[fieldName]) {
        this.fieldErrors[fieldName] = [];
      }
    },
    sortBooks() {
      this.books.sort((a, b) => {
        return a.id - b.id;
      });
    },
    validateFields() {
      this.fieldErrors = {};

      if (!this.editedItem.name) {
        this.fieldErrors.name = ["Campo obrigatório"];
      }
      if (!this.editedItem.author) {
        this.fieldErrors.author = ["Campo obrigatório"];
      }
      if (!this.editedItem.publisherId) {
        this.fieldErrors.publisherId = ["Campo obrigatório"];
      }
      if (!this.editedItem.releaseYear) {
        this.fieldErrors.releaseYear = ["Campo obrigatório"];
      }
      if (!this.editedItem.amount) {
        this.fieldErrors.amount = ["Campo obrigatório"];
      }

      return Object.keys(this.fieldErrors).length === 0;
    },

    save() {
      const fieldsAreValid = this.validateFields();
      if (!fieldsAreValid) {
        return;
      }
      if (!this.editedItem.id) {
        Book.save(this.editedItem)
          .then(() => {
            this.dialog = false;
            this.editedItem = {};
            this.fieldErrors = {};
            Swal.fire({
              icon: "success",
              title: "Livro Adicionado Com sucesso!",
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
              title: "Erro ao Salvar Livro",
              text: error.response.data.message,
              confirmButtonColor: "#F27474",
              allowOutsideClick: false,
            });
          });
      } else {
        this.update();
      }
    },
    loadPublishers() {
      Publisher.list().then((result) => {
        this.publishers = result.data;
      });
    },
    update() {
      Book.update(this.editedItem)
        .then(() => {
          this.dialog = false;
          this.editedItem = {};
          Swal.fire({
            icon: "success",
            title: "Livro Atualizado com sucesso!",
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
            title: "Erro ao Editar Livro",
            text: error.response.data.message,
            confirmButtonColor: "#F27474",
            allowOutsideClick: false,
          });
        });
    },
    showDialog(book) {
      this.editedItem = { ...book };
      this.dialog = true;
    },
    deleteItem(book) {
      Swal.fire({
        title: "Deseja Excluir o Livro?",
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
          Book.delete(book.id)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Livro Deletado Com Sucesso!",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
              this.getList();
            })
            .catch((error) => {
              console.log(error);
              Swal.fire({
                icon: "error",
                title: "Erro ao Deletar Livro",
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