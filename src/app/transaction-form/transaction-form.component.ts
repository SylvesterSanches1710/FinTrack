import { Component } from "@angular/core";
import { TransactionService } from "../transaction.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-transaction-form",
  imports: [FormsModule, CommonModule],
  templateUrl: "./transaction-form.component.html",
  styleUrl: "./transaction-form.component.scss",
})
export class TransactionFormComponent {
  amount: number = 0;
  type: string = "Expense";
  category: string = "";
  account: string = "";
  notes: string = "";
  date: string = "";
  editMode: boolean = false;
  editIndex: number = -1;

  accounts: any[] = [];

  constructor(private transactionService: TransactionService) {}

  categories = [
    "Food",
    "Fuel",
    "Bills",
    "Investment",
    "Shopping",
    "Health",
    "Groceries",
    "Travel",
  ];

  selectedCategory: string = "";
  customCategory: string = "";

  addTransaction() {
    let finalDate = this.date;

    if (!finalDate) {
      finalDate = new Date().toISOString().split("T")[0];
    }
    let finalCategory = "";

    if (this.selectedCategory === "Other") {
      finalCategory = this.customCategory.trim();
    } else {
      finalCategory = this.selectedCategory;
    }

    const transaction = {
      amount: this.amount,
      type: this.type,
      category: finalCategory,
      account: this.account,
      notes: this.notes,
      date: finalDate,
    };

    if (this.editMode) {
      this.transactionService.updateTransaction(this.editIndex, transaction);
      this.editMode = false;
      this.editIndex = -1;
    } else {
      this.transactionService.addTransaction(transaction);
    }
    this.amount = 0;
    this.type = "Expense";
    this.category = "";
    this.account = "";
    this.notes = "";
    this.date = "";
    this.selectedCategory = "";
    this.customCategory = "";
  }

  cancelEdit() {
    this.editMode = false;
    this.editIndex = -1;

    this.amount = 0;
    this.type = "Expense";
    this.category = "";
    this.account = "";
    this.notes = "";
    this.date = "";
    this.selectedCategory = "";
    this.customCategory = "";
  }

  ngOnInit() {
    this.transactionService.editTransaction$.subscribe((data) => {
      const t = data.transaction;

      this.amount = t.amount;
      this.type = t.type;
      this.category = t.category;
      this.account = t.account;
      this.notes = t.notes;
      this.date = t.date;
      this.selectedCategory = "";
      this.customCategory = "";

      this.editMode = true;
      this.editIndex = data.index;
    });
    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });
    this.accounts = this.transactionService.getAccounts();
  }
}
