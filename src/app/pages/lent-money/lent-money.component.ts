import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { TransactionService } from '../../transaction.service';

@Component({
  selector: 'app-lent-money',

  imports: [CommonModule, FormsModule],

  templateUrl: './lent-money.component.html',

  styleUrl: './lent-money.component.scss',
})
export class LentMoneyComponent {
  lendings: any[] = [];

  showModal = false;

  person = '';

  amount = 0;

  recovered = 0;

  note = '';

  date = '';

  accounts: any[] = [];

  selectedAccount = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.lendings$.subscribe((data) => {
      this.lendings = [...data].reverse();
    });
    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });
    // RECOVER OLD LENDINGS
    // FROM TRANSACTIONS

    const existingLendings = this.transactionService.getLendings();

    if (existingLendings.length === 0) {
      const transactions = this.transactionService.getTransactions();

      const lendingTransactions = transactions.filter(
        (t: any) => t.category === 'Lent Money',
      );

      lendingTransactions.forEach((t: any) => {
        const person = t.notes?.replace('Lent to ', '');

        this.transactionService.addLending({
          person,

          amount: t.amount,

          recovered: 0,

          remaining: t.amount,

          account: t.account,

          note: t.notes,

          date: t.date,

          status: 'Pending',
        });
      });
    }
  }

  addLending() {
    if (!this.person || !this.selectedAccount || this.amount <= 0) {
      return;
    }

    const finalDate = this.date || new Date().toISOString().split('T')[0];

    // SAVE LENDING ENTRY

    this.transactionService.addLending({
      person: this.person,

      amount: this.amount,

      recovered: 0,

      account: this.selectedAccount,

      remaining: this.amount,

      note: this.note,

      date: finalDate,

      status: 'Pending',
    });

    // CREATE REAL TRANSACTION

    this.transactionService.addTransaction({
      amount: this.amount,

      type: 'Expense',

      category: 'Lent Money',

      account: this.selectedAccount,

      notes: `Lent to ${this.person}`,

      date: finalDate,
    });

    this.resetForm();
  }

  deleteLending(index: number) {
    const originalIndex =
      this.transactionService.getLendings().length - 1 - index;

    const lendings = this.transactionService.getLendings();

    const lending = lendings[originalIndex];

    // DELETE LENDING ENTRY

    this.transactionService.deleteLending(originalIndex);

    // REMOVE RELATED TRANSACTIONS

    const transactions = this.transactionService.getTransactions();

    const updatedTransactions = transactions.filter((t: any) => {
      // REMOVE LENDING EXPENSE

      const lentMatch =
        t.category === 'Lent Money' &&
        t.account === lending.account &&
        t.amount === lending.amount &&
        t.notes === `Lent to ${lending.person}`;

      // REMOVE RECOVERY INCOME

      const recoveryMatch =
        t.category === 'Recovered Money' &&
        t.account === lending.account &&
        t.notes === `Recovered from ${lending.person}`;

      return !lentMatch && !recoveryMatch;
    });
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    this.transactionService.refreshTransactions();
  }

  resetForm() {
    this.person = '';

    this.amount = 0;

    this.recovered = 0;

    this.note = '';

    this.date = '';

    this.selectedAccount = '';

    this.showModal = false;
  }

  showRecoveryModal = false;

  recoveryAmount = 0;

  selectedLendingIndex = -1;

  openRecoveryModal(index: number) {
    this.selectedLendingIndex = index;

    this.recoveryAmount = 0;

    this.showRecoveryModal = true;
  }

  updateRecovery() {
    const originalIndex =
      this.transactionService.getLendings().length -
      1 -
      this.selectedLendingIndex;

    const lendings = this.transactionService.getLendings();

    const lending = lendings[originalIndex];

    lending.recovered += Number(this.recoveryAmount);

    lending.remaining = lending.amount - lending.recovered;

    // STATUS

    if (lending.remaining <= 0) {
      lending.status = 'Recovered';

      lending.remaining = 0;
    } else if (lending.recovered > 0) {
      lending.status = 'Partial';
    }

    this.transactionService.updateLending(
      originalIndex,

      lending,
    );
    this.transactionService.addTransaction({
      amount: this.recoveryAmount,

      type: 'Income',

      category: 'Recovered Money',

      account: lending.account,

      notes: `Recovered from ${lending.person}`,

      date: new Date().toISOString().split('T')[0],
    });

    this.showRecoveryModal = false;
  }
}
