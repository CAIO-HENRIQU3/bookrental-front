<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="filteredReturnedRentals"
      class="elevation-1"
      :footer-props="footerProps"
      mobile-breakpoint="850"
    >
      <template slot="top">
        <v-toolbar flat>
          <v-col cols="5" sm="2" md="2" lg="2">
            <v-toolbar-title>Aluguéis</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-col>
          <v-row>
            <v-col cols="7" sm="2" md="2" lg="2">
              <v-btn color="#272727" dark @click="dialog = true">
                Novo +
              </v-btn>
              <v-spacer></v-spacer>
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
                  {{ editedItem.id ? "Devolver Aluguel" : "Novo Aluguel" }}
                </span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="60" md="30">
                      <v-autocomplete
                        v-model="editedItem.bookId"
                        :items="books"
                        item-text="name"
                        item-value="id"
                        label="Livro"
                        :error-messages="fieldErrors.bookId"
                        @input="clearFieldError('bookId')"
                      >
                        <template v-slot:item="{ item }">
                          <v-list-item-content>
                            <v-list-item-title
                              v-html="item.name"
                            ></v-list-item-title>
                            <v-list-item-subtitle
                              v-html="item.publisherName"
                            ></v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-autocomplete
                        v-model="editedItem.userId"
                        :items="users"
                        item-text="name"
                        item-value="id"
                        label="Usuário"
                        :error-messages="fieldErrors.userId"
                        @input="clearFieldError('userId')"
                      >
                        <template v-slot:item="{ item }">
                          <v-list-item-content>
                            <v-list-item-title
                              v-html="item.name"
                            ></v-list-item-title>
                            <v-list-item-subtitle
                              v-html="item.email"
                            ></v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="60" md="30">
                      <v-text-field
                        label="Previsão de Devolução"
                        v-model="editedItem.forecastDate"
                        :error-messages="fieldErrors.forecastDate"
                        @input="clearFieldError('forecastDate')"
                        type="date"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#272727" text @click="close">Cancelar</v-btn>
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
      <template slot="item.rentalDate" slot-scope="{ item }">
        {{ item.rentalDate | formateDate }}
      </template>
      <template slot="item.forecastDate" slot-scope="{ item }">
        {{ item.forecastDate | formateDate }}
      </template>
      <template slot="item.returnDate" slot-scope="{ item }">
        {{ item.returnDate | formateDate }}
      </template>
      <template slot="item.status" slot-scope="{ item }">
        <v-chip :color="getStatusColor(item)" label class="chip-light">
          {{ getStatusLabel(item) }}
        </v-chip>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-icon
          size="20px"
          color="#272727"
          class="mr-2"
          v-if="!noActions(item)"
          @click="showDialog(item)"
          >mdi-book-arrow-left</v-icon
        >
        <span v-else>-</span>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import Rent from "@/services/rents";
import Book from "@/services/books";
import Publisher from "@/services/publishers";
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
        { text: "Livro", align: "start", value: "bookName" },
        { text: "Usuario", value: "userName" },
        { text: "Data do Aluguel", value: "rentalDate" },
        { text: "Previsão de Devoluçao", value: "forecastDate" },
        { text: "Data de Devolução", value: "returnDate" },
        { text: "Status", value: "status", sortable: false },
        { text: "Ações", align: "center", value: "actions", sortable: false },
      ],
      rents: [],
      books: [],
      publishers: [],
      users: [],
      editedIndex: -1,
      editedItem: {
        id: null,
        book: {
          bookId: null,
          bookName: "",
        },
        user: {
          userId: null,
          userName: "",
        },
        rentalDate: "",
        returnDate: "",
        forecastDate: "",
        status: "",
      },
      fieldErrors: {},
      footerProps: {
        itemsPerPageText: "Linhas por página:",
      },
      defaultItem: {
        id: null,
        book: {
          bookId: null,
          bookName: "",
        },
        user: {
          userId: null,
          userName: "",
        },
        rentalDate: "",
        returnDate: "",
        forecastDate: "",
        status: "",
      },
    };
  },
  filters: {
    truncateText(value, maxLength) {
    if (value && value.length > maxLength) {
      return value.substring(0, maxLength) + '...';
    }
    return value;
  },
    formateDate: function (value) {
      if (value) {
        const date = new Date(value);
        const day = String(date.getDate() + 1).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    },
  },
  computed: {
    filteredReturnedRentals() {
      return this.rents.filter((rents) =>
        this.filtersSearch(rents, this.search)
      );
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.getList();
    this.loadBooks();
    this.loadPublishers();
    this.loadUsers();
  },
  methods: {
    getList() {
      Rent.list().then((result) => {
        this.rents = result.data;
        this.sortRents();
      });
    },
    clearFieldError(fieldName) {
      if (this.fieldErrors[fieldName]) {
        this.fieldErrors[fieldName] = [];
      }
    },
    sortRents() {
      this.rents.sort((a, b) => {
        return a.id - b.id;
      });
    },
    validateFields() {
      this.fieldErrors = {};

      if (!this.editedItem.bookId) {
        this.fieldErrors.bookId = ["Campo obrigatório"];
      }
      if (!this.editedItem.userId) {
        this.fieldErrors.userId = ["Campo obrigatório"];
      }
      if (!this.editedItem.forecastDate) {
        this.fieldErrors.forecastDate = ["Campo obrigatório"];
      }

      return Object.keys(this.fieldErrors).length === 0;
    },

    save() {
      const fieldsAreValid = this.validateFields();
      if (!fieldsAreValid) {
        return;
      }
      if (!this.editedItem.id) {
        Rent.save(this.editedItem)
          .then(() => {
            this.dialog = false;
            this.fieldErrors = {};
            Swal.fire({
              icon: "success",
              title: "Aluguel Adicionado Com sucesso!",
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
              title: "Erro ao Salvar Aluguel",
              text: error.response.data.message,
              confirmButtonColor: "#F27474",
              allowOutsideClick: false,
            });
          });
      } else {
        this.update();
      }
    },
    loadUsers() {
      User.list().then((result) => {
        this.users = result.data;
      });
    },
    loadPublishers() {
      Publisher.list().then((result) => {
        this.publishers = result.data;
      });
    },
    loadBooks() {
      Book.list().then((result) => {
        this.books = result.data;
      });
    },
    update() {
      Rent.update(this.editedItem.id, this.editedItem)
        .then(() => {
          this.dialog = false;
          this.editedItem = {};
          this.getList();
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Erro ao Editar Aluguel",
            text: error.response.data.message,
            confirmButtonColor: "#F27474",
            allowOutsideClick: false,
          });
        });
    },
    showDialog(rent) {
      Swal.fire({
        title: "Deseja Devolver o Aluguel?",
        text: "Essa Ação Não Pode Ser Desfeita!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Devolver",
        confirmButtonColor: "#F8BB86",
        cancelButtonColor: "#272727",
        reverseButtons: true,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          rent.returnDate = new Date().toISOString().substr(0, 10);
          Rent.update(rent.id)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Aluguel Devolvido Com Sucesso!",
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
                title: "Erro ao Devolver Aluguel",
                text: error.response.data.message,
                confirmButtonColor: "#F27474",
                allowOutsideClick: false,
              });
            });
        }
      });
    },
    noActions(item) {
      const today = new Date().toISOString().substr(0, 10);

      if (item.returnDate) {
        return true;
      } else if (item.forecastDate < today) {
        return false;
      } else {
        return false;
      }
    },

    getStatusColor(item) {
      if (item.status === "RETURNED_DELAY") {
        return "#FF3838";
      } else if (item.status === "RETURNED_ON_TIME") {
        return "#56F000";
      } else if (item.status === "LATE_RENT") {
        return "#FFB302";
      } else if (item.status === "PENDING_RENT") {
        return "#FCE83A";
      }
    },

    getStatusLabel(item) {
      if (item.status === "RETURNED_DELAY") {
        return "Devolvido Com Atraso";
      } else if (item.status === "RETURNED_ON_TIME") {
        return "Devolvido No Prazo";
      } else if (item.status === "LATE_RENT") {
        return "Atrasado";
      } else if (item.status === "PENDING_RENT") {
        return "Pendente";
      }
    },
    filtersSearch(rent, search) {
      const searchLower = search.toLowerCase();
      const rentIdMatchs = String(rent.id).toLowerCase().includes(searchLower);
      const userMatchs = rent.userName.toLowerCase().includes(searchLower);
      const bookMatchs = rent.bookName.toLowerCase().includes(searchLower);
      const statusLabel = this.getStatusLabel(rent);
      const statusMatchs = statusLabel.toLowerCase().includes(searchLower);
      const dateMatchs =
        this.matchesDateSearch(rent.rentalDate, searchLower) ||
        this.matchesDateSearch(rent.forecastDate, searchLower) ||
        this.matchesDateSearch(rent.returnDate, searchLower);

      return (
        userMatchs || bookMatchs || rentIdMatchs || statusMatchs || dateMatchs
      );
    },
    matchesDateSearch(dateString, search) {
      if (!dateString) {
        return false;
      }
      const date = new Date(dateString);
      const day = String(date.getDate() + 1).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      const formatedData = `${day}/${month}/${year}`;
      return formatedData.includes(search);
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
.chip-light {
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  height: 25px;
  width: 165px;
  padding: 0 13px;
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
