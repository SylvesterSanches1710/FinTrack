import { Component } from "@angular/core";

import { TransactionService } from "../../transaction.service";

import { FormsModule } from "@angular/forms";

import { CommonModule } from "@angular/common";

@Component({
  selector: "app-transfers",

  imports: [FormsModule, CommonModule],

  templateUrl: "./transfers.component.html",

  styleUrl: "./transfers.component.scss",
})
export class TransfersComponent {
  accounts: any[] = [];

  categories: string[] = [];

  transfers: any[] = [];

  fromAccount = "";

  toAccount = "";

  amount = 0;

  category = "";

  note = "";

  date = "";

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadData();

    // LIVE ACCOUNTS

    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });

    // LIVE CATEGORIES

    this.transactionService.categories$.subscribe((data) => {
      this.categories = data;
    });

    // LIVE TRANSFERS

    this.transactionService.transactions$.subscribe(() => {
      this.transfers = this.transactionService
        .getTransactions()

        .filter((t: any) => t.type === "Transfer");
    });
  }

  loadData() {
    this.accounts = this.transactionService.getAccounts();

    this.categories = this.transactionService.getCategories();

    this.transfers = this.transactionService
      .getTransactions()

      .filter((t: any) => t.type === "Transfer");
  }

  submitTransfer() {
    if (!this.fromAccount || !this.toAccount || !this.amount) {
      return;
    }

    if (this.fromAccount === this.toAccount) {
      return;
    }

    this.transactionService.transferMoney(
      this.fromAccount,

      this.toAccount,

      this.amount,

      this.note,

      this.date,

      this.category,
    );

    // RESET

    this.fromAccount = "";

    this.toAccount = "";

    this.amount = 0;

    this.category = "";

    this.note = "";

    this.date = "";
  }
}
