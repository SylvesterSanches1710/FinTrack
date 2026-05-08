import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TransactionService } from "../../transaction.service";
import { TransactionFormComponent } from "../../transaction-form/transaction-form.component";
import { RouterLink } from "@angular/router";

interface Account {
  name: string;
  balance: number;
  color: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
  balances: { [key: string]: number } = {};

  balanceList: {
    name: string;
    value: number;
    color: string;
  }[] = [];

  monthlyExpense = 0;

  totalWorth = 0;

  recentTransactions: any[] = [];

  currentMonth = "";
  categorySpend: any[] = [];
  showTransactionModal = false;

  constructor(private transactionService: TransactionService) {}

  openTransactionModal() {
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
  }

  ngOnInit() {
    // Current Month

    const now = new Date();

    this.currentMonth = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // REACTIVE DATA

    this.transactionService.transactions$.subscribe((transactions) => {
      const accounts = this.transactionService.getAccounts();

      this.calculate(transactions, accounts);

      // Latest 5 transactions

      this.recentTransactions = [...transactions].reverse().slice(0, 5);
    });

    // ACCOUNT CHANGES

    this.transactionService.accounts$.subscribe((accounts) => {
      const transactions = this.transactionService.getTransactions();

      this.calculate(transactions, accounts);
    });
  }

  calculate(transactions: any[], accounts: Account[]) {
    this.monthlyExpense = 0;
    this.balances = {};

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Initialize balances
    accounts.forEach((acc: Account) => {
      this.balances[acc.name] = Number(acc.balance);
    });

    // Apply transactions
    transactions.forEach((t: any) => {
      const amount = Number(t.amount);
      const date = new Date(t.date);

      if (!this.balances[t.account]) {
        this.balances[t.account] = 0;
      }

      if (t.type === "Income") {
        this.balances[t.account] += amount;
      } else {
        this.balances[t.account] -= amount;
      }

      // Monthly expense
      if (
        t.type === "Expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        this.monthlyExpense += amount;
      }
    });

    // Create UI list
    this.balanceList = accounts.map((acc: Account) => ({
      name: acc.name,
      value: this.balances[acc.name],
      color: acc.color || "blue",
    }));

    // Total worth
    this.totalWorth = this.balanceList.reduce((sum, acc) => sum + acc.value, 0);

    const categoryTotals: any = {};

    transactions.forEach((t: any) => {
      if (t.type === "Expense") {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }

        categoryTotals[t.category] += Number(t.amount);
      }
    });

    const colors = ["#4d8dff", "#20d997", "#ffb020", "#ff4d57", "#8b5cf6"];

    const totalExpenses = (Object.values(categoryTotals) as number[]).reduce(
      (a, b) => a + b,
      0,
    );

    this.categorySpend = Object.entries(categoryTotals).map(
      ([category, amount]: any, index) => ({
        category,
        amount,
        percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: colors[index % colors.length],
      }),
    );
  }
}
