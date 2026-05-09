import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

export interface Budget {
  category: string;

  limit: number;

  color: string;
}

export interface Goal {
  title: string;

  target: number;

  saved: number;

  color: string;
}

export interface RecurringTransaction {
  title: string;

  amount: number;

  type: string;

  category: string;

  account: string;

  frequency: string;

  nextDate: string;
}

export interface Lending {
  person: string;

  amount: number;

  recovered: number;

  remaining: number;

  note: string;

  date: string;

  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  // =========================
  // RECURRING TRANSACTIONS
  // =========================

  private recurringTransactions: RecurringTransaction[] = JSON.parse(
    localStorage.getItem('recurring') || '[]',
  );

  // =========================
  // BUDGETS
  // =========================

  private budgets: Budget[] = JSON.parse(
    localStorage.getItem('budgets') || '[]',
  );

  // =========================
  // GOALS
  // =========================

  private goals: Goal[] = JSON.parse(localStorage.getItem('goals') || '[]');

  // =========================
  // TRANSACTIONS STATE
  // =========================

  private transactionsSubject = new BehaviorSubject<any[]>(
    this.loadTransactions(),
  );

  transactions$ = this.transactionsSubject.asObservable();

  // =========================
  // ACCOUNTS STATE
  // =========================

  private accountsSubject = new BehaviorSubject<any[]>(this.loadAccounts());

  accounts$ = this.accountsSubject.asObservable();

  // =========================
  // EDIT EVENT
  // =========================

  editTransaction$ = new BehaviorSubject<any>(null);

  constructor() {
    this.processRecurringTransactions();
  }

  // =========================
  // TRANSACTIONS
  // =========================

  getTransactions() {
    return this.transactionsSubject.value;
  }

  addTransaction(transaction: any) {
    const updated = [...this.transactionsSubject.value, transaction];

    localStorage.setItem('transactions', JSON.stringify(updated));

    this.transactionsSubject.next(updated);
  }

  deleteTransaction(index: number) {
    const updated = [...this.transactionsSubject.value];

    updated.splice(index, 1);

    localStorage.setItem('transactions', JSON.stringify(updated));

    this.transactionsSubject.next(updated);
  }

  updateTransaction(index: number, updatedTransaction: any) {
    const updated = [...this.transactionsSubject.value];

    updated[index] = updatedTransaction;

    localStorage.setItem('transactions', JSON.stringify(updated));

    this.transactionsSubject.next(updated);
  }

  loadTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  // =========================
  // ACCOUNTS
  // =========================

  getAccounts() {
    return this.accountsSubject.value;
  }

  addAccount(account: any) {
    const updated = [...this.accountsSubject.value, account];

    localStorage.setItem('accounts', JSON.stringify(updated));

    this.accountsSubject.next(updated);
  }

  deleteAccount(name: string) {
    const updated = this.accountsSubject.value.filter(
      (acc: any) => acc.name !== name,
    );

    localStorage.setItem('accounts', JSON.stringify(updated));

    this.accountsSubject.next(updated);
  }

  loadAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
  }

  // =========================
  // BUDGETS
  // =========================

  getBudgets() {
    return this.budgets;
  }

  addBudget(budget: Budget) {
    this.budgets.push(budget);

    localStorage.setItem('budgets', JSON.stringify(this.budgets));
  }

  deleteBudget(category: string) {
    this.budgets = this.budgets.filter(
      (budget) => budget.category !== category,
    );

    localStorage.setItem('budgets', JSON.stringify(this.budgets));
  }

  // =========================
  // GOALS
  // =========================

  getGoals() {
    return this.goals;
  }

  addGoal(goal: Goal) {
    this.goals.push(goal);

    localStorage.setItem('goals', JSON.stringify(this.goals));
  }

  deleteGoal(title: string) {
    this.goals = this.goals.filter((goal) => goal.title !== title);

    localStorage.setItem('goals', JSON.stringify(this.goals));
  }

  addSavingsToGoal(title: string, amount: number) {
    this.goals = this.goals.map((goal) => {
      if (goal.title === title) {
        return {
          ...goal,

          saved: goal.saved + amount,
        };
      }

      return goal;
    });

    localStorage.setItem('goals', JSON.stringify(this.goals));
  }

  // =========================
  // RECURRING TRANSACTIONS
  // =========================

  getRecurringTransactions() {
    return this.recurringTransactions;
  }

  addRecurringTransaction(recurring: RecurringTransaction) {
    this.recurringTransactions.push(recurring);

    localStorage.setItem(
      'recurring',
      JSON.stringify(this.recurringTransactions),
    );
  }

  deleteRecurringTransaction(title: string) {
    this.recurringTransactions = this.recurringTransactions.filter(
      (r) => r.title !== title,
    );

    localStorage.setItem(
      'recurring',
      JSON.stringify(this.recurringTransactions),
    );
  }

  processRecurringTransactions() {
    const today = new Date();

    let transactions = this.getTransactions();

    let recurring = this.getRecurringTransactions();

    recurring = recurring.map((r: any) => {
      const dueDate = new Date(r.nextDate);

      // IF DUE

      if (dueDate <= today) {
        const alreadyExists = transactions.some(
          (t: any) =>
            t.category === r.category &&
            t.amount === r.amount &&
            t.date === r.nextDate,
        );

        // AVOID DUPLICATES

        if (!alreadyExists) {
          transactions.push({
            amount: r.amount,

            type: r.type,

            category: r.category,

            account: r.account,

            date: r.nextDate,
          });
        }

        // UPDATE NEXT DATE

        const next = new Date(r.nextDate);

        if (r.frequency === 'Weekly') {
          next.setDate(next.getDate() + 7);
        }

        if (r.frequency === 'Monthly') {
          next.setMonth(next.getMonth() + 1);
        }

        if (r.frequency === 'Yearly') {
          next.setFullYear(next.getFullYear() + 1);
        }

        r.nextDate = next.toISOString().split('T')[0];
      }

      return r;
    });

    // SAVE UPDATED TRANSACTIONS

    localStorage.setItem('transactions', JSON.stringify(transactions));

    this.transactionsSubject.next(transactions);

    // SAVE UPDATED RECURRING

    localStorage.setItem('recurring', JSON.stringify(recurring));

    this.recurringTransactions = recurring;
  }

  // =========================
  // TRANSFERS
  // =========================
  private updateAccounts(accounts: any[]) {
    this.accountsSubject.next(accounts);
  }

  private updateState(transactions: any[]) {
    this.transactionsSubject.next(transactions);
  }

  transferMoney(
    from: string,
    to: string,
    amount: number,
    note: string,
    date: string,
  ) {
    const accounts = this.getAccounts();

    const updatedAccounts = accounts.map((acc: any) => {
      // REMOVE FROM SOURCE

      if (acc.name === from) {
        return {
          ...acc,

          balance: acc.balance - amount,
        };
      }

      // ADD TO TARGET

      if (acc.name === to) {
        return {
          ...acc,

          balance: acc.balance + amount,
        };
      }

      return acc;
    });

    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

    this.updateAccounts(updatedAccounts);

    // CREATE TRANSFER RECORD

    const transactions = this.getTransactions();

    transactions.push({
      type: 'Transfer',

      amount,

      category: 'Transfer',

      account: `${from} → ${to}`,

      note,

      date,
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));

    this.updateState(transactions);
  }

  // =========================
  // LENT MONEY
  // =========================

  private lendingSubject = new BehaviorSubject<any[]>(this.getLendings());

  lendings$ = this.lendingSubject.asObservable();

  getLendings() {
    return JSON.parse(localStorage.getItem('lendings') || '[]');
  }

  private updateLendings(lendings: any[]) {
    this.lendingSubject.next(lendings);
  }

  addLending(lending: any) {
    const lendings = this.getLendings();

    lendings.push(lending);

    localStorage.setItem(
      'lendings',

      JSON.stringify(lendings),
    );

    this.updateLendings(lendings);
  }

  updateLending(index: number, updated: any) {
    const lendings = this.getLendings();

    lendings[index] = updated;

    localStorage.setItem(
      'lendings',

      JSON.stringify(lendings),
    );

    this.updateLendings(lendings);
  }

  deleteLending(index: number) {
    const lendings = this.getLendings();

    lendings.splice(index, 1);

    localStorage.setItem(
      'lendings',

      JSON.stringify(lendings),
    );

    this.updateLendings(lendings);
  }

  refreshTransactions() {
    const transactions = JSON.parse(
      localStorage.getItem('transactions') || '[]',
    );

    this.transactionsSubject.next(transactions);
  }
}
