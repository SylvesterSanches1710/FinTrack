import { Component, OnInit } from "@angular/core";
import { TransactionService } from "../transaction.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
  selector: "app-transaction-list",
  imports: [CommonModule, FormsModule],
  templateUrl: "./transaction-list.component.html",
  styleUrl: "./transaction-list.component.scss",
})
export class TransactionListComponent implements OnInit {
  selectedAccount: string = "";
  selectedType: string = "";
  selectedMonth: string = "";

  transactions: any[] = [];
  accounts: any[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.transactions$.subscribe((data) => {
      this.transactions = data;
    });
    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });
  }

  deleteTransaction(index: number) {
    this.transactionService.deleteTransaction(index);
  }
  editTransaction(transaction: any, index: number) {
    this.transactionService.editTransaction$.next({ transaction, index });
  }

  filteredTransactions() {
    return this.transactions.filter((t) => {
      const accountMatch = this.selectedAccount
        ? t.account === this.selectedAccount
        : true;
      const typeMatch = this.selectedType ? t.type === this.selectedType : true;

      let monthMatch = true;

      if (this.selectedMonth) {
        const date = new Date(t.date);
        const transactionMonth = date.toISOString().slice(0, 7); // YYYY-MM

        monthMatch = transactionMonth === this.selectedMonth;
      }

      return accountMatch && typeMatch && monthMatch;
    });
  }
  exportCSV() {
    const data = this.transactions;

    if (!data.length) {
      alert("No data to export");
      return;
    }

    const headers = ["Amount", "Type", "Category", "Account", "Notes", "Date"];

    const rows = data.map((t) => [
      t.amount,
      t.type,
      t.category,
      t.account,
      t.notes,
      t.date,
    ]);

    let csvContent = "";

    csvContent += headers.join(",") + "\n";

    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    link.click();
  }
}
