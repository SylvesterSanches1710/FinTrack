import { Component } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfers',
  imports: [FormsModule, CommonModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {

  accounts: any[] = [];

  transfers: any[] = [];

  fromAccount = '';

  toAccount = '';

  amount = 0;

  note = '';

  date = '';

  constructor(
    private transactionService:
      TransactionService
  ) {}

  ngOnInit() {

    this.loadData();

  }

  loadData() {

    this.accounts =
      this.transactionService
        .getAccounts();

    this.transfers =
      this.transactionService
        .getTransactions()
        .filter(
          (t: any) =>
            t.type === 'Transfer'
        );

  }

  submitTransfer() {

    if (
      !this.fromAccount ||
      !this.toAccount ||
      !this.amount
    ) {
      return;
    }

    if (
      this.fromAccount ===
      this.toAccount
    ) {
      return;
    }

    this.transactionService
      .transferMoney(

        this.fromAccount,

        this.toAccount,

        this.amount,

        this.note,

        this.date

      );

    this.fromAccount = '';

    this.toAccount = '';

    this.amount = 0;

    this.note = '';

    this.date = '';

    this.loadData();

  }

}
