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

  getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Food':          'ti ti-tools-kitchen-2',
    'Restaurant':    'ti ti-tools-kitchen-2',
    'Fuel':          'ti ti-gas-station',
    'Bills':         'ti ti-file-invoice',
    'Investment':    'ti ti-chart-line',
    'Shopping':      'ti ti-shopping-bag',
    'Health':        'ti ti-heart-rate-monitor',
    'Groceries':     'ti ti-basket',
    'Travel':        'ti ti-plane',
    'Entertainment': 'ti ti-device-tv',
    'Transfer':      'ti ti-switch-horizontal',
    'Salary':        'ti ti-cash',
    'Other':         'ti ti-dots-circle-horizontal',
  };
  return icons[category] ?? 'ti ti-dots-circle-horizontal';
}

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
    const originalIndex =
      this.transactionService.getTransactions().length - 1 - index;

    this.transactionService.editTransaction$.next({
      transaction,

      index: originalIndex,
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
      // REVERSED ARRAY FIX

      const originalIndex =
        this.transactionService.getTransactions().length -
        1 -
        this.selectedTransactionIndex;

      this.transactionService.deleteTransaction(originalIndex);
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
