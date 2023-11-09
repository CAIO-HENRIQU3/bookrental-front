<template>
  <v-container>
    <v-card>
      <v-card-title>Dashboard</v-card-title>
      <v-card-text>
        <v-card>
          <v-card-title>Livros Mais Alugados</v-card-title>
          <v-card-text>
            <v-row class="d-flex flex-sm-row flex-column">
              <v-col
                cols="12"
                md="6"
                lg="3"
                v-for="(mostRentedBooks, index) in mostRentedBooks"
                :key="index"
              >
                <v-card>
                  <v-card-title class="topBooksTitle">{{
                    mostRentedBooks.name
                  }}</v-card-title>
                  <v-card-text>
                    {{ mostRentedBooks.totalRented }} aluguéis
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-divider class="mt-4"></v-divider>
      </v-card-text>
      <v-card class="responsiveTable">
        <v-card-title>Últimos Aluguéis</v-card-title>
        <v-card-text>
          <v-row class="d-flex flex-sm-row flex-column">
            <v-col>
              <v-data-table
                :headers="headers"
                :items="latestRents"
                class="elevation-1"
                mobile-breakpoint="2000"
                style="width: 100%; max-height: 285px; overflow-y: auto"
              >
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
                  <v-chip
                    :color="getStatusColor(item)"
                    label
                    class="chip-light"
                  >
                    {{ getStatusLabel(item) }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <div class="responsiveChart">
        <v-row class="d-flex flex-sm-row flex-column">
          <v-col>
            <pie-chart />
          </v-col>
        </v-row>
      </div>
      <v-divider class="mt-4"></v-divider>
    </v-card>
  </v-container>
</template>

<script>
import PieChart from "@/components/PieChart.vue";
import Book from "@/services/books";
import Rent from "@/services/rents";

export default {
  components: {
    PieChart,
  },
  data() {
    return {
      mostRentedBooks: [],
      latestRents: [],
      headers: [
        { text: "Id", align: "start", value: "id" },
        { text: "Livro", align: "start", value: "bookName" },
        { text: "Usuário", value: "userName" },
        { text: "Data do Aluguel", value: "rentalDate" },
        { text: "Previsão de Devolução", value: "forecastDate" },
        { text: "Data de Devolução", value: "returnDate" },
        { text: "Status", value: "status", sortable: false },
      ],
    };
  },
  async mounted() {
    await this.loadLatestRents();
    await this.fetchMostRentedBooks();
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
  methods: {
    randomValue() {
      return Math.floor(Math.random() * 100) + 1;
    },

    async fetchMostRentedBooks() {
      try {
        const response = await Book.getMostRentBooks();
        this.mostRentedBooks = response.data;
      } catch (error) {
        console.error("Erro ao buscar os livros mais alugados:", error);
      }
    },
    async loadLatestRents() {
      try {
        const response = await Rent.list();
        this.latestRents = response.data
          .sort(
            (a, b) => b.id - a.id || b.rentalDate.localeCompare(a.rentalDate)
          )
          .slice(0, 20);
      } catch (error) {
        console.error("Error loading latest rentals:", error);
      }
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
  },
};
</script>

<style scoped>
.v-btn.ml-auto .v-icon {
  margin-right: 0;
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
.responsiveChart {
  max-width: 300px;
  height: 100%;
  min-height: 365px;
  display: flex;
  float: right;
  justify-content: center;
  align-items: center;
}
.responsiveTable {
  width: 75%;
  margin-left: 16px;
  display: inline-block;
  max-height: 380px;
}
.topBooksTitle {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
@media screen and (max-width: 1300px) {
  .responsiveTable {
    width: 98%;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 380px;
  }
  .responsiveChart {
    display: flex;
    float: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 300px;
    height: 100%;
    min-height: 365px;
    margin: 25px auto;
  }
  .topBooksTitle {
    font-size: 16px;
    white-space: initial;
    overflow: visible;
    text-overflow: initial;
  }
}
</style>
