import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { CloudDataService } from './services/cloud-data.service';

export interface Budget {
  title: string;

  categories: string[];

  limit: number;

  period: string;

  recurring: boolean;

  color: string;
}

export interface Goal {
  title: string;

  target: number;

  linkedCategory: string;

  linkedAccount?: string;

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
  categories: string[] = [];
  categoriesSubject = new BehaviorSubject<string[]>([]);

  categories$ = this.categoriesSubject.asObservable();

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

  constructor(private cloudData: CloudDataService) {
    const savedCategories = localStorage.getItem('categories');

    // DEFAULT CATEGORIES

    const defaultCategories = [
      'Salary',

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
    ];

    // EXISTING USER DATA

    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);

      // MERGE MISSING DEFAULTS

      this.categories = [...new Set([...defaultCategories, ...parsed])];
    }

    // FIRST TIME USER
    else {
      this.categories = defaultCategories;
    }

    // SAVE UPDATED LIST

    localStorage.setItem(
      'categories',

      JSON.stringify(this.categories),
    );

    // EMIT INITIAL DATA

    this.categoriesSubject.next(this.categories);
    this.syncToCloud();

    this.processRecurringTransactions();
  }
  // =========================
  // CLOUD SAVE
  // =========================

  async syncToCloud() {
    await this.cloudData.saveUserData(
      'transactions',
      this.transactionsSubject.value,
    );

    await this.cloudData.saveUserData('accounts', this.accountsSubject.value);

    await this.cloudData.saveUserData('goals', this.goals);

    await this.cloudData.saveUserData('budgets', this.budgets);

    await this.cloudData.saveUserData('recurring', this.recurringTransactions);

    await this.cloudData.saveUserData('categories', this.categories);
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

    this.syncToCloud();
  }

  deleteTransaction(index: number) {
    const updated = [...this.transactionsSubject.value];

    updated.splice(index, 1);

    localStorage.setItem('transactions', JSON.stringify(updated));

    this.transactionsSubject.next(updated);

    this.syncToCloud();
  }

  updateTransaction(index: number, updatedTransaction: any) {
    const updated = [...this.transactionsSubject.value];

    updated[index] = updatedTransaction;

    localStorage.setItem('transactions', JSON.stringify(updated));

    this.transactionsSubject.next(updated);

    this.syncToCloud();
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
    this.syncToCloud();
  }

  deleteAccount(name: string) {
    const updated = this.accountsSubject.value.filter(
      (acc: any) => acc.name !== name,
    );

    localStorage.setItem('accounts', JSON.stringify(updated));

    this.accountsSubject.next(updated);
    this.syncToCloud();
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
    this.syncToCloud();
  }

  deleteBudget(title: string) {
    this.budgets = this.budgets.filter((budget) => budget.title !== title);

    localStorage.setItem(
      'budgets',

      JSON.stringify(this.budgets),
    );

    this.syncToCloud();
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
    this.syncToCloud();
  }

  deleteGoal(title: string) {
    this.goals = this.goals.filter((goal) => goal.title !== title);

    localStorage.setItem('goals', JSON.stringify(this.goals));
    this.syncToCloud();
  }

  updateGoal(index: number, updatedGoal: Goal) {
    this.goals[index] = updatedGoal;

    localStorage.setItem(
      'goals',

      JSON.stringify(this.goals),
    );

    this.syncToCloud();
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

    // PROCESS IMMEDIATELY

    this.processRecurringTransactions();
    this.syncToCloud();
  }

  deleteRecurringTransaction(title: string) {
    this.recurringTransactions = this.recurringTransactions.filter(
      (r) => r.title !== title,
    );

    localStorage.setItem(
      'recurring',
      JSON.stringify(this.recurringTransactions),
    );
    this.syncToCloud();
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
    category?: string,
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

      category: category || 'Transfer',

      account: `${from} → ${to}`,

      note,

      date,
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));

    this.updateState(transactions);
    this.syncToCloud();
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
    this.syncToCloud();
  }

  updateLending(index: number, updated: any) {
    const lendings = this.getLendings();

    lendings[index] = updated;

    localStorage.setItem(
      'lendings',

      JSON.stringify(lendings),
    );

    this.updateLendings(lendings);
    this.syncToCloud();
  }

  deleteLending(index: number) {
    const lendings = this.getLendings();

    lendings.splice(index, 1);

    localStorage.setItem(
      'lendings',

      JSON.stringify(lendings),
    );

    this.updateLendings(lendings);
    this.syncToCloud();
  }

  refreshTransactions() {
    const transactions = JSON.parse(
      localStorage.getItem('transactions') || '[]',
    );

    this.transactionsSubject.next(transactions);
  }

  // =========================
  // CATEGORIES
  // =========================

  getCategories() {
    return this.categories;
  }

  addCategory(category: string) {
    const exists = this.categories.some(
      (c) => c.toLowerCase() === category.toLowerCase(),
    );

    if (exists || !category.trim()) {
      return;
    }

    this.categories.push(category);

    localStorage.setItem(
      'categories',

      JSON.stringify(this.categories),
    );
    this.categoriesSubject.next(this.categories);
  }

  // =========================
  // CLOUD RESTORE
  // =========================

  async restoreFromCloud() {
    // TRANSACTIONS

    const transactions = await this.cloudData.loadUserData('transactions');

    if (transactions) {
      localStorage.setItem(
        'transactions',

        JSON.stringify(transactions),
      );

      this.transactionsSubject.next(transactions);
    }

    // ACCOUNTS

    const accounts = await this.cloudData.loadUserData('accounts');

    if (accounts) {
      localStorage.setItem(
        'accounts',

        JSON.stringify(accounts),
      );

      this.accountsSubject.next(accounts);
    }

    // GOALS

    const goals = await this.cloudData.loadUserData('goals');

    if (goals) {
      this.goals = goals;

      localStorage.setItem(
        'goals',

        JSON.stringify(goals),
      );
    }

    // BUDGETS

    const budgets = await this.cloudData.loadUserData('budgets');

    if (budgets) {
      this.budgets = budgets;

      localStorage.setItem(
        'budgets',

        JSON.stringify(budgets),
      );
    }

    // RECURRING

    const recurring = await this.cloudData.loadUserData('recurring');

    if (recurring) {
      this.recurringTransactions = recurring;

      localStorage.setItem(
        'recurring',

        JSON.stringify(recurring),
      );
    }

    // CATEGORIES

    const categories = await this.cloudData.loadUserData('categories');

    if (categories) {
      const defaultCategories = [
        'Salary',

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
      ];

      // MERGE DEFAULTS + CLOUD

      this.categories = [...new Set([...defaultCategories, ...categories])];

      localStorage.setItem(
        'categories',

        JSON.stringify(this.categories),
      );

      this.categoriesSubject.next(this.categories);
    }
  }
  // =========================
  // AI INSIGHTS ENGINE
  // =========================

  generateAIInsights() {
    const insights: string[] = [];

    const transactions = this.getTransactions();

    const currentMonth = new Date().getMonth();

    const currentYear = new Date().getFullYear();

    let income = 0;

    let expense = 0;

    const categoryTotals: any = {};

    // CURRENT MONTH DATA

    transactions.forEach((t: any) => {
      const date = new Date(t.date);

      if (
        date.getMonth() !== currentMonth ||
        date.getFullYear() !== currentYear
      ) {
        return;
      }

      // INCOME

      if (t.type === 'Income') {
        income += Number(t.amount);
      }

      // EXPENSES

      if (t.type === 'Expense') {
        expense += Number(t.amount);

        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }

        categoryTotals[t.category] += Number(t.amount);
      }
    });

    // SAVINGS

    const savings = income - expense;

    // PROJECTED EXPENSE

    const today = new Date();

    const avgDaily = expense / today.getDate();

    const daysInMonth = new Date(
      currentYear,

      currentMonth + 1,

      0,
    ).getDate();

    const projectedExpense = Math.round(avgDaily * daysInMonth);

    // INSIGHTS

    insights.push(`Projected monthly spending: ₹${projectedExpense}.`);

    if (savings < 0) {
      insights.push(`You are currently overspending this month.`);
    } else {
      insights.push(`Current monthly savings: ₹${savings}.`);
    }

    // TOP CATEGORY

    const top = Object.entries(categoryTotals)

      .sort((a: any, b: any) => b[1] - a[1])[0];

    if (top) {
      insights.push(`${top[0]} is your top expense category this month.`);
    }

    return insights;
  }
}
