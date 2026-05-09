import { Component } from '@angular/core';

import { TransactionService } from '../transaction.service';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-form',

  imports: [FormsModule, CommonModule],

  templateUrl: './transaction-form.component.html',

  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent {
  amount: number = 0;

  type: string = 'Expense';

  account: string = '';

  notes: string = '';

  date: string = '';

  editMode: boolean = false;

  editIndex: number = -1;

  accounts: any[] = [];

  categories = [
    'Food',

    'Fuel',

    'Bills',

    'Investment',

    'Shopping',

    'Health',

    'Groceries',

    'Travel',
    'Entertainment',
    'Restaurant',

    'Other',
  ];

  selectedCategory: string = '';

  customCategory: string = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    // EDIT TRANSACTION

    this.transactionService.editTransaction$.subscribe((data) => {
      const t = data.transaction;

      this.amount = t.amount;

      this.type = t.type;

      this.selectedCategory = t.category;

      this.account = t.account;

      this.notes = t.notes;

      this.date = t.date;

      this.editMode = true;

      this.editIndex = data.index;
    });

    // LIVE ACCOUNTS

    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });
  }

  addTransaction() {
    let finalDate = this.date;

    if (!finalDate) {
      finalDate = new Date().toISOString().split('T')[0];
    }

    let finalCategory = '';

    if (this.selectedCategory === 'Other') {
      finalCategory = this.customCategory.trim();
    } else {
      finalCategory = this.selectedCategory;
    }

    const transaction = {
      amount: Number(this.amount),

      type: this.type,

      category: finalCategory,

      account: this.account,

      notes: this.notes,

      date: finalDate,
    };

    // EDIT

    if (this.editMode) {
      this.transactionService.updateTransaction(
        this.editIndex,

        transaction,
      );
    }

    // CREATE
    else {
      this.transactionService.addTransaction(transaction);
    }

    // RESET

    this.resetForm();
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.amount = 0;

    this.type = 'Expense';

    this.selectedCategory = '';

    this.account = '';

    this.notes = '';

    this.date = '';

    this.customCategory = '';

    this.editMode = false;

    this.editIndex = -1;
  }
}
