import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionService } from '../../transaction.service';
import { BaseChartDirective } from 'ng2-charts';

import { ChartConfiguration, ChartType } from 'chart.js';
import 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  transactions: any[] = [];

  totalIncome = 0;

  totalExpense = 0;

  savings = 0;

  topCategory = '';

  categoryData: {
    category: string;
    amount: number;
    percent: number;
    color: string;
  }[] = [];

  colors = ['#4d8dff', '#20d997', '#ff4d57', '#ffc107', '#b26bff', '#ff922b'];
  pieChartType: 'doughnut' = 'doughnut';

  pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#4d8dff',
          '#20d997',
          '#ff4d57',
          '#ffc107',
          '#b26bff',
          '#ff922b',
        ],

        borderWidth: 0,
      },
    ],
  };

  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
  };

  lineChartType: 'line' = 'line';

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: 'white',
        },

        grid: {
          color: '#222',
        },
      },

      y: {
        ticks: {
          color: 'white',
        },

        grid: {
          color: '#222',
        },
      },
    },
  };

  insights: string[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.transactions$.subscribe((transactions: any[]) => {
      this.transactions = transactions;

      this.calculateAnalytics();
    });
  }

  calculateAnalytics() {
    this.totalIncome = 0;

    this.totalExpense = 0;

    const categoryTotals: any = {};

    this.transactions.forEach((t: any) => {
      if (t.type === 'Income') {
        this.totalIncome += Number(t.amount);
      }

      if (t.type === 'Expense') {
        this.totalExpense += Number(t.amount);

        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }

        categoryTotals[t.category] += Number(t.amount);
      }
    });

    this.savings = this.totalIncome - this.totalExpense;

    const categories = Object.entries(categoryTotals);

    const highest = categories.sort((a: any, b: any) => b[1] - a[1])[0];

    this.topCategory = highest ? String(highest[0]) : '-';

    this.categoryData = categories.map(
      ([category, amount]: any, index: number) => {
        const percent =
          this.totalExpense > 0 ? (amount / this.totalExpense) * 100 : 0;

        return {
          category,
          amount,
          percent,
          color: this.colors[index % this.colors.length],
        };
      },
    );
    this.pieChartData = {
      labels: this.categoryData.map((item) => item.category),

      datasets: [
        {
          data: this.categoryData.map((item) => item.amount),

          backgroundColor: this.categoryData.map((item) => item.color),

          borderWidth: 0,
        },
      ],
    };
    const monthlyMap: any = {};

    this.transactions.forEach((t: any) => {
      const month = new Date(t.date).toLocaleString('default', {
        month: 'short',
      });

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          income: 0,
          expense: 0,
        };
      }

      if (t.type === 'Income') {
        monthlyMap[month].income += t.amount;
      }

      if (t.type === 'Expense') {
        monthlyMap[month].expense += t.amount;
      }
    });

    const labels = Object.keys(monthlyMap);

    const incomeData = labels.map((month) => monthlyMap[month].income);

    const expenseData = labels.map((month) => monthlyMap[month].expense);

    this.lineChartData = {
      labels,

      datasets: [
        {
          label: 'Income',

          data: incomeData,

          borderColor: '#20d997',

          backgroundColor: '#20d997',

          tension: 0.4,
        },

        {
          label: 'Expenses',

          data: expenseData,

          borderColor: '#ff4d57',

          backgroundColor: '#ff4d57',

          tension: 0.4,
        },
      ],
    };

    this.generateInsights();
  }
  generateInsights() {
    this.insights = [];

    // Highest category

    if (this.categoryData.length > 0) {
      const top = this.categoryData[0];

      this.insights.push(
        `${top.category} is your highest spending category at ₹${top.amount}.`,
      );
    }

    // Savings insight

    const savings = this.totalIncome - this.totalExpense;

    if (savings > 0) {
      this.insights.push(`You saved ₹${savings} this period. Great job!`);
    } else {
      this.insights.push(`You overspent by ₹${Math.abs(savings)} this period.`);
    }

    // Transaction count

    this.insights.push(
      `You recorded ${this.transactions.length} total transactions.`,
    );

    // Highest expense

    const expenses = this.transactions.filter((t: any) => t.type === 'Expense');

    if (expenses.length > 0) {
      const biggest = expenses.reduce((max: any, t: any) =>
        t.amount > max.amount ? t : max,
      );

      this.insights.push(
        `Your biggest expense was ₹${biggest.amount} on ${biggest.category}.`,
      );
    }
  }
}
