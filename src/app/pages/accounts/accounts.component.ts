import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from '../../transaction.service';

@Component({
  selector: 'app-accounts',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent {

  accounts: any[] = [];

  totalWorth = 0;

  showAddModal = false;

  selectedBank = '';

  customBankName = '';

  balance = 0;

  banks = [
    'HDFC',
    'Canara',
    'SBI',
    'ICICI',
    'Axis',
    'Kotak',
    'Bank of Baroda'
  ];

  colors = [
    '#4d8dff',
    '#20d997',
    '#ff4d57',
    '#ffc107',
    '#b26bff'
  ];

  constructor(
    private transactionService: TransactionService
  ) {}

  ngOnInit() {

    this.loadAccounts();

  }

  loadAccounts() {

    this.accounts =
      this.transactionService.getAccounts();

    this.accounts.forEach(
      (acc: any, index: number) => {

        acc.color =
          this.colors[index % this.colors.length];

      }
    );

    this.calculateNetWorth();

  }

  calculateNetWorth() {

    this.totalWorth =
      this.accounts.reduce(
        (sum: number, acc: any) =>
          sum + acc.balance,
        0
      );

  }

  addAccount() {

    const finalName =
      this.selectedBank === 'Other'
        ? this.customBankName
        : this.selectedBank;

    if (!finalName || this.balance <= 0) {
      return;
    }

    if (this.accounts.length >= 5) {
      return;
    }

    const exists = this.accounts.some(
      (acc: any) =>
        acc.name.toLowerCase() ===
        finalName.toLowerCase()
    );

    if (exists) {
      return;
    }

    const newAccount = {
      name: finalName,
      balance: this.balance
    };

    this.accounts.push(newAccount);

    localStorage.setItem(
      'accounts',
      JSON.stringify(this.accounts)
    );

    this.selectedBank = '';

    this.customBankName = '';

    this.balance = 0;

    this.showAddModal = false;

    this.loadAccounts();

  }

  deleteAccount(name: string) {

    const confirmed = confirm(
      `Delete ${name} account?`
    );

    if (!confirmed) {
      return;
    }

    this.accounts =
      this.accounts.filter(
        (acc: any) => acc.name !== name
      );

    localStorage.setItem(
      'accounts',
      JSON.stringify(this.accounts)
    );

    const transactions =
      this.transactionService.getTransactions();

    const updatedTransactions =
      transactions.filter(
        (t: any) => t.account !== name
      );

    localStorage.setItem(
      'transactions',
      JSON.stringify(updatedTransactions)
    );

    this.transactionService.loadTransactions();

    this.loadAccounts();

  }

}
