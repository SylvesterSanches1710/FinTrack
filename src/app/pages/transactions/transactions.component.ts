import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TransactionService } from "../../transaction.service";
import { TransactionFormComponent } from "../../transaction-form/transaction-form.component";
import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

@Component({
  selector: "app-transactions",
  imports: [CommonModule, FormsModule, TransactionFormComponent],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent {
  transactions: any[] = [];

  searchTerm = "";

  selectedType = "";

  showTransactionModal = false;

  activeMenuIndex: number | null = null;

  showDeleteModal = false;

  selectedTransactionIndex: number | null = null;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.transactions$.subscribe((data) => {
      this.transactions = [...data].reverse();
    });
  }

  filteredTransactions() {
    return this.transactions.filter((t) => {
      const matchesSearch =
        !this.searchTerm ||
        t.category?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || t.type === this.selectedType;

      return matchesSearch && matchesType;
    });
  }

  openTransactionModal() {
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
  }

  toggleMenu(index: number) {
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
  }

  editTransaction(transaction: any, index: number) {
    this.transactionService.editTransaction$.next({
      transaction,
      index,
    });

    this.showTransactionModal = true;

    this.activeMenuIndex = null;
  }

  openDeleteModal(index: number) {
    this.selectedTransactionIndex = index;

    this.showDeleteModal = true;

    this.activeMenuIndex = null;
  }

  confirmDelete() {
    if (this.selectedTransactionIndex !== null) {
      const transactions = this.transactionService.getTransactions();

      transactions.splice(this.selectedTransactionIndex, 1);

      localStorage.setItem("transactions", JSON.stringify(transactions));

      this.transactionService.loadTransactions();
    }

    this.showDeleteModal = false;

    this.selectedTransactionIndex = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  exportCSV() {
    const transactions = this.filteredTransactions();

    if (!transactions.length) {
      return;
    }

    const headers = ["Date", "Category", "Type", "Amount", "Account"];

    const rows = transactions.map((t: any) => [
      t.date,

      t.category,

      t.type,

      t.amount,

      t.account,
    ]);

    const csvContent = [
      headers.join(","),

      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", "transactions.csv");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  exportPDF() {
    const doc = new jsPDF();

    // TITLE

    doc.setFontSize(22);

    doc.text("Fintrack Financial Report", 14, 20);

    // DATE

    doc.setFontSize(11);

    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    // TRANSACTIONS

    const rows = this.filteredTransactions().map((t: any) => [
      t.date,

      t.category,

      t.type,

      `₹${t.amount}`,

      t.account,
    ]);

    autoTable(doc, {
      head: [["Date", "Category", "Type", "Amount", "Account"]],

      body: rows,

      startY: 40,

      theme: "grid",

      styles: {
        fillColor: [20, 20, 20],

        textColor: 255,
      },

      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    // SAVE

    doc.save("fintrack-report.pdf");
  }
}
