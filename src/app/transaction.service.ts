import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CloudDataService } from './services/cloud-data.service';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';

// =============================================================================
// INTERFACES
// =============================================================================

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

export interface Investment {
  type: string;
  name: string;
  symbol?: string;
  quantity: number;
  investedAmount: number;
  currentValue: number;
  avgPrice?: number;
  platform?: string;
  notes?: string;
  livePrice?: number;
}

// =============================================================================
// SERVICE
// =============================================================================

@Injectable({ providedIn: 'root' })
export class TransactionService {
  // ---------------------------------------------------------------------------
  // DEFAULT CATEGORIES
  // ---------------------------------------------------------------------------

  private readonly DEFAULT_CATEGORIES = [
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

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  categories: string[] = [];
  categoriesSubject = new BehaviorSubject<string[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<any[]>(
    this.loadTransactions(),
  );
  transactions$ = this.transactionsSubject.asObservable();

  private accountsSubject = new BehaviorSubject<any[]>(this.loadAccounts());
  accounts$ = this.accountsSubject.asObservable();

  private lendingSubject = new BehaviorSubject<any[]>(this.getLendings());
  lendings$ = this.lendingSubject.asObservable();

  editTransaction$ = new BehaviorSubject<any>(null);

  private budgets: Budget[] = JSON.parse(
    localStorage.getItem('budgets') || '[]',
  );
  private goals: Goal[] = JSON.parse(localStorage.getItem('goals') || '[]');
  private recurringTransactions: RecurringTransaction[] = JSON.parse(
    localStorage.getItem('recurring') || '[]',
  );
  private investments: Investment[] = JSON.parse(
    localStorage.getItem('investments') || '[]',
  );
  private investmentsSubject = new BehaviorSubject<Investment[]>(
    this.investments,
  );

  investments$ = this.investmentsSubject.asObservable();

  // ---------------------------------------------------------------------------
  // CONSTRUCTOR
  // ---------------------------------------------------------------------------

  constructor(
    private cloudData: CloudDataService,

    private firestore: Firestore,
  ) {
    this.initCategories();
    this.syncToCloud();
    this.processRecurringTransactions();
  }

  private initCategories(): void {
    const saved = localStorage.getItem('categories');
    const parsed: string[] = saved ? JSON.parse(saved) : [];
    this.categories = [...new Set([...this.DEFAULT_CATEGORIES, ...parsed])];
    localStorage.setItem('categories', JSON.stringify(this.categories));
    this.categoriesSubject.next(this.categories);
  }

  // ---------------------------------------------------------------------------
  // CLOUD SYNC
  // ---------------------------------------------------------------------------

  async syncToCloud(): Promise<void> {
    await this.cloudData.saveUserData(
      'transactions',
      this.transactionsSubject.value,
    );
    await this.cloudData.saveUserData('accounts', this.accountsSubject.value);
    await this.cloudData.saveUserData('goals', this.goals);
    await this.cloudData.saveUserData('budgets', this.budgets);
    await this.cloudData.saveUserData('recurring', this.recurringTransactions);
    await this.cloudData.saveUserData('categories', this.categories);
    await this.cloudData.saveUserData('investments', this.investments);
  }

  async restoreFromCloud(): Promise<void> {
    const transactions = await this.cloudData.loadUserData('transactions');
    if (transactions) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      this.transactionsSubject.next(transactions);
    }

    const accounts = await this.cloudData.loadUserData('accounts');
    if (accounts) {
      localStorage.setItem('accounts', JSON.stringify(accounts));
      this.accountsSubject.next(accounts);
    }

    const goals = await this.cloudData.loadUserData('goals');
    if (goals) {
      this.goals = goals;
      localStorage.setItem('goals', JSON.stringify(goals));
    }

    const budgets = await this.cloudData.loadUserData('budgets');
    if (budgets) {
      this.budgets = budgets;
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }

    const recurring = await this.cloudData.loadUserData('recurring');
    if (recurring) {
      this.recurringTransactions = recurring;
      localStorage.setItem('recurring', JSON.stringify(recurring));
    }

    const categories = await this.cloudData.loadUserData('categories');
    if (categories) {
      this.categories = [
        ...new Set([...this.DEFAULT_CATEGORIES, ...categories]),
      ];
      localStorage.setItem('categories', JSON.stringify(this.categories));
      this.categoriesSubject.next(this.categories);
    }

    const investments = await this.cloudData.loadUserData('investments');
    if (investments) {
      this.investments = investments;
      this.investmentsSubject.next(investments);
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  }

  startRealtimeSync() {
    const userId = localStorage.getItem('uid');

    if (!userId) {
      return;
    }

    // =====================================
    // TRANSACTIONS
    // =====================================

    const transactionsRef = doc(
      this.firestore,

      `users/${userId}/finance/transactions`,
    );

    onSnapshot(
      transactionsRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data()['data'];

        localStorage.setItem(
          'transactions',

          JSON.stringify(data),
        );

        this.transactionsSubject.next(data);

        console.log('Transactions synced');
      },
    );

    // =====================================
    // ACCOUNTS
    // =====================================

    const accountsRef = doc(
      this.firestore,

      `users/${userId}/finance/accounts`,
    );

    onSnapshot(
      accountsRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data()['data'];

        localStorage.setItem(
          'accounts',

          JSON.stringify(data),
        );

        this.accountsSubject.next(data);

        console.log('Accounts synced');
      },
    );

    // =====================================
    // INVESTMENTS
    // =====================================

    const investmentsRef = doc(
      this.firestore,

      `users/${userId}/finance/investments`,
    );

    onSnapshot(
      investmentsRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data()['data'];

        this.investments = data;

        localStorage.setItem(
          'investments',

          JSON.stringify(data),
        );

        this.investmentsSubject.next(data);

        console.log('Investments synced');
      },
    );
  }

  // ---------------------------------------------------------------------------
  // TRANSACTIONS
  // ---------------------------------------------------------------------------

  getTransactions(): any[] {
    return this.transactionsSubject.value;
  }

  loadTransactions(): any[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  refreshTransactions(): void {
    this.transactionsSubject.next(this.loadTransactions());
  }

  addTransaction(transaction: any): void {
    const updated = [...this.transactionsSubject.value, transaction];
    this.saveTransactions(updated);
  }

  updateTransaction(index: number, updated: any): void {
    const transactions = [...this.transactionsSubject.value];
    transactions[index] = updated;
    this.saveTransactions(transactions);
  }

  deleteTransaction(index: number): void {
    const updated = [...this.transactionsSubject.value];
    updated.splice(index, 1);
    this.saveTransactions(updated);
  }

  private saveTransactions(transactions: any[]): void {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    this.transactionsSubject.next(transactions);
    this.syncToCloud();
  }

  private updateState(transactions: any[]): void {
    this.transactionsSubject.next(transactions);
  }

  // ---------------------------------------------------------------------------
  // ACCOUNTS
  // ---------------------------------------------------------------------------

  getAccounts(): any[] {
    return this.accountsSubject.value;
  }

  loadAccounts(): any[] {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
  }

  addAccount(account: any): void {
    const updated = [...this.accountsSubject.value, account];
    this.saveAccounts(updated);
  }

  deleteAccount(name: string): void {
    const updated = this.accountsSubject.value.filter(
      (acc: any) => acc.name !== name,
    );
    this.saveAccounts(updated);
  }

  private saveAccounts(accounts: any[]): void {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    this.accountsSubject.next(accounts);
    this.syncToCloud();
  }

  private updateAccounts(accounts: any[]): void {
    this.accountsSubject.next(accounts);
  }

  // ---------------------------------------------------------------------------
  // BUDGETS
  // ---------------------------------------------------------------------------

  getBudgets(): Budget[] {
    return this.budgets;
  }

  addBudget(budget: Budget): void {
    this.budgets.push(budget);
    this.saveBudgets();
  }

  deleteBudget(title: string): void {
    this.budgets = this.budgets.filter((b) => b.title !== title);
    this.saveBudgets();
  }

  private saveBudgets(): void {
    localStorage.setItem('budgets', JSON.stringify(this.budgets));
    this.syncToCloud();
  }

  // ---------------------------------------------------------------------------
  // GOALS
  // ---------------------------------------------------------------------------

  getGoals(): Goal[] {
    return this.goals;
  }

  addGoal(goal: Goal): void {
    this.goals.push(goal);
    this.saveGoals();
  }

  deleteGoal(title: string): void {
    this.goals = this.goals.filter((g) => g.title !== title);
    this.saveGoals();
  }

  private saveGoals(): void {
    localStorage.setItem('goals', JSON.stringify(this.goals));
    this.syncToCloud();
  }

  // ---------------------------------------------------------------------------
  // RECURRING TRANSACTIONS
  // ---------------------------------------------------------------------------

  getRecurringTransactions(): RecurringTransaction[] {
    return this.recurringTransactions;
  }

  addRecurringTransaction(recurring: RecurringTransaction): void {
    this.recurringTransactions.push(recurring);
    this.saveRecurring();
    this.processRecurringTransactions();
  }

  deleteRecurringTransaction(title: string): void {
    this.recurringTransactions = this.recurringTransactions.filter(
      (r) => r.title !== title,
    );
    this.saveRecurring();
  }

  private saveRecurring(): void {
    localStorage.setItem(
      'recurring',
      JSON.stringify(this.recurringTransactions),
    );
    this.syncToCloud();
  }

  processRecurringTransactions(): void {
    const today = new Date();
    let transactions = this.getTransactions();

    this.recurringTransactions = this.recurringTransactions.map((r: any) => {
      const dueDate = new Date(r.nextDate);
      if (dueDate > today) return r;

      const alreadyExists = transactions.some(
        (t: any) =>
          t.category === r.category &&
          t.amount === r.amount &&
          t.date === r.nextDate,
      );

      if (!alreadyExists) {
        transactions.push({
          amount: r.amount,
          type: r.type,
          category: r.category,
          account: r.account,
          date: r.nextDate,
        });
      }

      const next = new Date(r.nextDate);
      if (r.frequency === 'Weekly') next.setDate(next.getDate() + 7);
      if (r.frequency === 'Monthly') next.setMonth(next.getMonth() + 1);
      if (r.frequency === 'Yearly') next.setFullYear(next.getFullYear() + 1);
      r.nextDate = next.toISOString().split('T')[0];

      return r;
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));
    this.transactionsSubject.next(transactions);
    localStorage.setItem(
      'recurring',
      JSON.stringify(this.recurringTransactions),
    );
  }

  // ---------------------------------------------------------------------------
  // TRANSFERS
  // ---------------------------------------------------------------------------

  transferMoney(
    from: string,
    to: string,
    amount: number,
    note: string,
    date: string,
    category?: string,
  ): void {
    const updatedAccounts = this.getAccounts().map((acc: any) => {
      if (acc.name === from) return { ...acc, balance: acc.balance - amount };
      if (acc.name === to) return { ...acc, balance: acc.balance + amount };
      return acc;
    });

    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    this.updateAccounts(updatedAccounts);

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

  // ---------------------------------------------------------------------------
  // LENT MONEY
  // ---------------------------------------------------------------------------

  getLendings(): any[] {
    return JSON.parse(localStorage.getItem('lendings') || '[]');
  }

  addLending(lending: any): void {
    const lendings = this.getLendings();
    lendings.push(lending);
    this.saveLendings(lendings);
  }

  updateLending(index: number, updated: any): void {
    const lendings = this.getLendings();
    lendings[index] = updated;
    this.saveLendings(lendings);
  }

  deleteLending(index: number): void {
    const lendings = this.getLendings();
    lendings.splice(index, 1);
    this.saveLendings(lendings);
  }

  private saveLendings(lendings: any[]): void {
    localStorage.setItem('lendings', JSON.stringify(lendings));
    this.lendingSubject.next(lendings);
    this.syncToCloud();
  }

  private updateLendings(lendings: any[]): void {
    this.lendingSubject.next(lendings);
  }

  // ---------------------------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------------------------

  getCategories(): string[] {
    return this.categories;
  }

  addCategory(category: string): void {
    const trimmed = category.trim();
    if (!trimmed) return;

    const exists = this.categories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return;

    this.categories.push(trimmed);
    localStorage.setItem('categories', JSON.stringify(this.categories));
    this.categoriesSubject.next(this.categories);
  }

  // ---------------------------------------------------------------------------
  // INVESTMENTS
  // ---------------------------------------------------------------------------

  getInvestments(): Investment[] {
    return this.investments;
  }

  addInvestment(investment: Investment): void {
    this.investments.push(investment);
    this.saveInvestments();
  }

  deleteInvestment(index: number): void {
    this.investments.splice(index, 1);
    this.saveInvestments();
  }

  saveEditedInvestments(investments: Investment[]): void {
    this.investments = investments;

    this.saveInvestments();
  }

  private saveInvestments(): void {
    localStorage.setItem(
      'investments',

      JSON.stringify(this.investments),
    );

    this.investmentsSubject.next(this.investments);

    this.syncToCloud();
  }

  // ---------------------------------------------------------------------------
  // AI INSIGHTS
  // ---------------------------------------------------------------------------

  generateAIInsights(): string[] {
    const insights: string[] = [];
    const transactions = this.getTransactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0;
    let expense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t: any) => {
      const date = new Date(t.date);
      if (
        date.getMonth() !== currentMonth ||
        date.getFullYear() !== currentYear
      )
        return;

      if (t.type === 'Income') {
        income += Number(t.amount);
      } else if (t.type === 'Expense') {
        expense += Number(t.amount);
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + Number(t.amount);
      }
    });

    const savings = income - expense;
    const avgDaily = expense / now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const projectedExpense = Math.round(avgDaily * daysInMonth);

    insights.push(`Projected monthly spending: ₹${projectedExpense}.`);
    insights.push(
      savings < 0
        ? 'You are currently overspending this month.'
        : `Current monthly savings: ₹${savings}.`,
    );

    const top = Object.entries(categoryTotals).sort(
      (a: any, b: any) => b[1] - a[1],
    )[0];
    if (top)
      insights.push(`${top[0]} is your top expense category this month.`);

    return insights;
  }
}
