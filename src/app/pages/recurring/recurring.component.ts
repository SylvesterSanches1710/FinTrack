import { Component } from '@angular/core';
import { RecurringTransaction, TransactionService } from '../../transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recurring',
  imports: [FormsModule, CommonModule],
  templateUrl: './recurring.component.html',
  styleUrl: './recurring.component.scss'
})
export class RecurringComponent {

  recurring:
    RecurringTransaction[] = [];

  showModal = false;

  newRecurring = {

    title: '',

    amount: 0,

    type: 'Expense',

    category: '',

    account: '',

    frequency: 'Monthly',

    nextDate: ''

  };

  constructor(
    private transactionService:
      TransactionService
  ) {}

  ngOnInit() {

    this.loadRecurring();

  }

  loadRecurring() {

    this.recurring =
      this.transactionService
        .getRecurringTransactions();

  }

  addRecurring() {

    if (
      !this.newRecurring.title ||
      !this.newRecurring.amount
    ) {
      return;
    }

    this.transactionService
      .addRecurringTransaction(
        this.newRecurring
      );

    this.loadRecurring();

    this.showModal = false;

    this.newRecurring = {

      title: '',

      amount: 0,

      type: 'Expense',

      category: '',

      account: '',

      frequency: 'Monthly',

      nextDate: ''

    };

  }

  deleteRecurring(title: string) {

    this.transactionService
      .deleteRecurringTransaction(title);

    this.loadRecurring();

  }

}
