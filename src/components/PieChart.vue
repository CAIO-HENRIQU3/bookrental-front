<template>
  <div class="chart-container">
    <apexchart
      :options="chartOptions"
      :series="chartSeries"
      type="pie"
      height="400"
    />
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import Rent from "@/services/rents";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      chartOptions: {
        labels: ["Pendente", "Atrasado", "Devolvido no Prazo", "Devolvido com Atraso"],
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          itemMargin: {
            vertical: 5,
            horizontal: 10,
          },
        },
        colors: ["#FCE83A", "#FFB302", "#56F000", "#FF3838"],
      },
      chartSeries: [0, 0, 0, 0],
    };
  },
  async created() {
    await Rent.getTotalByStatus()
      .then((item) => {
        this.chartSeries = Object.values(item.data[0]);
      })
      .catch((error) => {
        this.$swal.fire({
          icon: "error",
          title: "Erro ao receber Dados!",
          text: error.response.data.message,
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
      });
  },
};
</script>

<style>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 220px;
}
@media screen and (max-width: 1300px) {
  .chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
