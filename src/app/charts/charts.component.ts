import { Component, OnInit } from "@angular/core";
import Chart from "chart.js/auto";
import { TransactionService } from "../transaction.service";

@Component({
  selector: "app-charts",
  imports: [],
  templateUrl: "./charts.component.html",
  styleUrl: "./charts.component.scss",
})
export class ChartsComponent implements OnInit {
  chart: any;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.transactions$.subscribe((data) => {
      this.createChart(data);
    });
  }

  createChart(transactions: any[]) {
    // Destroy old chart if exists
    if (this.chart) {
      this.chart.destroy();
    }

    const categoryMap: any = {};

    transactions.forEach((t) => {
      if (t.type === "Expense") {
        categoryMap[t.category] =
          (categoryMap[t.category] || 0) + Number(t.amount);
      }
    });

    const labels = Object.keys(categoryMap);
    const values = Object.values(categoryMap);

    this.chart = new Chart('categoryChart', {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      data: values
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false 
  }
});
  }
}
