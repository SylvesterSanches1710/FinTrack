import { Component } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Account {
  name: string;
  balance: number;
  color: string;
}

@Component({
  selector: 'app-transfer',
  imports: [FormsModule, CommonModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
})
export class TransferComponent {
  accounts: Account[] = [];

  fromAccount = '';
  toAccount = '';
  amount = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.accounts$.subscribe((data: Account[]) => {
      this.accounts = data;
    });
  }

  transfer() {
    // validations
    if (!this.fromAccount || !this.toAccount || this.amount <= 0) {
      alert('Fill all fields');
      return;
    }

    if (this.fromAccount === this.toAccount) {
      alert('Cannot transfer to same account');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // 🔥 Expense transaction
    this.transactionService.addTransaction({
      amount: this.amount,
      type: 'Expense',
      category: 'Transfer',
      account: this.fromAccount,
      notes: `Transfer to ${this.toAccount}`,
      date: today,
    });

    // 🔥 Income transaction
    this.transactionService.addTransaction({
      amount: this.amount,
      type: 'Income',
      category: 'Transfer',
      account: this.toAccount,
      notes: `Transfer from ${this.fromAccount}`,
      date: today,
    });

    alert('Transfer successful');

    // reset
    this.fromAccount = '';
    this.toAccount = '';
    this.amount = 0;
  }
}
