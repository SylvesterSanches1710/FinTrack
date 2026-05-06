import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

interface Account {
  name: string;
  balance: number;
  color: string;
}

@Injectable({
  providedIn: "root",
})
export class TransactionService {
  private accountsSubject = new BehaviorSubject<any[]>(this.getAccounts());
  accounts$ = this.accountsSubject.asObservable();

  private updateAccounts(accounts: any[]) {
    this.accountsSubject.next(accounts);
  }
  private transactionsSubject = new BehaviorSubject<any[]>(
    this.getTransactions(),
  );
  transactions$ = this.transactionsSubject.asObservable();
  editTransaction$ = new Subject<any>();

  constructor() {}

  getTransactions() {
    return JSON.parse(localStorage.getItem("transactions") || "[]");
  }

  private updateState(transactions: any[]) {
    this.transactionsSubject.next(transactions);
  }

  addTransaction(transaction: any) {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    this.updateState(transactions);
  }

  deleteTransaction(index: number) {
    const transactions = this.getTransactions();
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    this.updateState(transactions);
  }
  updateTransaction(index: number, updated: any) {
    const transactions = this.getTransactions();
    transactions[index] = updated;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    this.updateState(transactions);
  }

  getAccounts() {
    return JSON.parse(localStorage.getItem("accounts") || "[]");
  }

  addAccount(account: any) {
    const accounts = this.getAccounts();
    accounts.push(account);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    this.updateAccounts(accounts);
  }

  deleteAccount(name: string) {
  const accounts = this.getAccounts().filter((acc: any) => acc.name !== name);
  localStorage.setItem('accounts', JSON.stringify(accounts));

  this.updateAccounts(accounts); // 🔥 keep UI reactive
}
}
