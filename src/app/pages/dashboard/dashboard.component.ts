import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { TransactionService } from '../../transaction.service';

@Component({
  selector: 'app-dashboard',

  imports: [CommonModule, RouterLink],

  templateUrl: './dashboard.component.html',

  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  currentMonth = '';

  monthlyExpense = 0;

  spendingChange = 0;

  balanceList: any[] = [];

  aiInsights: string[] = [];

  greeting = '';

  userName = localStorage.getItem('displayName') || 'User';

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.setGreeting();
    this.loadDashboard();
  }

  loadDashboard() {
    const now = new Date();

    this.currentMonth = now.toLocaleString(
      'default',

      {
        month: 'long',

        year: 'numeric',
      },
    );

    const transactions = this.transactionService.getTransactions();

    const accounts = this.transactionService.getAccounts();

    // CURRENT MONTH

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();

    // PREVIOUS MONTH

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // MONTHLY EXPENSE

    this.monthlyExpense = transactions
      .filter((t: any) => {
        const d = new Date(t.date);

        return (
          t.type === 'Expense' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })

      .reduce(
        (sum: number, t: any) => sum + t.amount,

        0,
      );

    // PREVIOUS MONTH EXPENSE

    const previousMonthExpense = transactions
      .filter((t: any) => {
        const d = new Date(t.date);

        return (
          t.type === 'Expense' &&
          d.getMonth() === previousMonth &&
          d.getFullYear() === previousYear
        );
      })

      .reduce(
        (sum: number, t: any) => sum + t.amount,

        0,
      );

    // PERCENT CHANGE

    this.spendingChange = this.getMonthlyChange(
      this.monthlyExpense,

      previousMonthExpense,
    );

    // ACCOUNT BALANCES

    this.balanceList = accounts.map((acc: any) => ({
      name: acc.name,

      value: acc.balance,

      color: 'blue',
    }));

    // INSIGHTS

    this.generateInsights(transactions);
  }

  getMonthlyChange(
    current: number,

    previous: number,
  ) {
    if (previous === 0) {
      return 100;
    }

    return ((current - previous) / previous) * 100;
  }

  generateInsights(transactions: any[]) {
    this.aiInsights = [];

    // TOTAL SPENDING

    const totalExpense = transactions
      .filter((t: any) => t.type === 'Expense')

      .reduce(
        (
          sum: number,

          t: any,
        ) => sum + t.amount,

        0,
      );

    // TOTAL INCOME

    const totalIncome = transactions
      .filter((t: any) => t.type === 'Income')

      .reduce(
        (
          sum: number,

          t: any,
        ) => sum + t.amount,

        0,
      );

    // SAVINGS

    const savings = totalIncome - totalExpense;

    // TOP CATEGORY

    const categoryTotals: any = {};

    transactions.forEach((t: any) => {
      if (t.type === 'Expense') {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const topCategory = Object.keys(categoryTotals).reduce(
      (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),

      '',
    );

    // INSIGHTS

    this.aiInsights.push(`Projected monthly spending: ₹${totalExpense}.`);

    this.aiInsights.push(`Current monthly savings: ₹${savings}.`);

    if (topCategory) {
      this.aiInsights.push(
        `${topCategory} is your top expense category this month.`,
      );
    }
  }
  setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (hour < 21) {
      this.greeting = 'Good Evening';
    } else {
      this.greeting = 'Good Evening';
    }
  }
}
