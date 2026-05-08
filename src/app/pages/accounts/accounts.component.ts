import { Component } from "@angular/core";

import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";

import { TransactionService } from "../../transaction.service";

@Component({
  selector: "app-accounts",

  imports: [CommonModule, FormsModule],

  templateUrl: "./accounts.component.html",

  styleUrl: "./accounts.component.scss",
})
export class AccountsComponent {
  accounts: any[] = [];

  totalWorth = 0;

  showAddModal = false;

  selectedBank = "";

  customBankName = "";

  balance = 0;

  banks = ["HDFC", "Canara", "SBI", "ICICI", "Axis", "Kotak", "Bank of Baroda"];

  colors = ["#4d8dff", "#20d997", "#ff4d57", "#ffc107", "#b26bff"];

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    // LIVE ACCOUNT CHANGES

    this.transactionService.accounts$.subscribe((accounts) => {
      this.accounts = [...accounts];

      this.calculateBalances();
    });

    // LIVE TRANSACTION CHANGES

    this.transactionService.transactions$.subscribe(() => {
      this.calculateBalances();
    });
  }

  calculateBalances() {
    const transactions = this.transactionService.getTransactions();

    this.accounts = this.accounts.map((acc: any, index: number) => {
      let currentBalance = Number(acc.balance);

      transactions.forEach((t: any) => {
        if (t.account !== acc.name) {
          return;
        }

        const amount = Number(t.amount);

        if (t.type === "Income") {
          currentBalance += amount;
        } else {
          currentBalance -= amount;
        }
      });

      return {
        ...acc,

        color: this.colors[index % this.colors.length],

        currentBalance,
      };
    });

    this.totalWorth = this.accounts.reduce(
      (sum: number, acc: any) => sum + acc.currentBalance,

      0,
    );
  }

  addAccount() {
    const finalName =
      this.selectedBank === "Other" ? this.customBankName : this.selectedBank;

    if (!finalName || this.balance < 0) {
      return;
    }

    if (this.accounts.length >= 5) {
      return;
    }

    const exists = this.accounts.some(
      (acc: any) => acc.name.toLowerCase() === finalName.toLowerCase(),
    );

    if (exists) {
      return;
    }

    this.transactionService.addAccount({
      name: finalName,

      balance: this.balance,
    });

    this.selectedBank = "";

    this.customBankName = "";

    this.balance = 0;

    this.showAddModal = false;
  }

  deleteAccount(name: string) {
    const confirmed = confirm(`Delete ${name} account?`);

    if (!confirmed) {
      return;
    }

    this.transactionService.deleteAccount(name);

    // REMOVE RELATED TRANSACTIONS

    const transactions = this.transactionService.getTransactions();

    const updatedTransactions = transactions.filter(
      (t: any) => t.account !== name,
    );

    localStorage.setItem(
      "transactions",

      JSON.stringify(updatedTransactions),
    );

    this.transactionService.loadTransactions();
  }
}
