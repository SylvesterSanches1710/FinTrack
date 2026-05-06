import { Component, OnInit } from "@angular/core";
import { TransactionService } from "../transaction.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { combineLatest } from "rxjs";

interface Account {
  name: string;
  balance: number;
  color: string;
}

@Component({
  selector: "app-dashboard",
  imports: [FormsModule, CommonModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  balances: { [key: string]: number } = {};
  balanceList: { name: string; value: number; color: string }[] = [];

  monthlyExpense = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    combineLatest([
      this.transactionService.transactions$,
      this.transactionService.accounts$,
    ]).subscribe(([transactions, accounts]) => {
      console.log("Accounts:", accounts); 
      console.log("Transactions:", transactions); 

      this.calculate(transactions, accounts);
    });
  }
  getCardClass(index: number): string {
    const classes = ["card-blue", "card-green", "card-purple"];
    return classes[index % classes.length];
  }

  calculate(transactions: any[], accounts: Account[]) {
    this.monthlyExpense = 0;
    this.balances = {};

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    
    accounts.forEach((acc: Account) => {
      this.balances[acc.name] = Number(acc.balance);
    });

    
    transactions.forEach((t: any) => {
      const amount = Number(t.amount);
      const date = new Date(t.date);

      if (!this.balances[t.account]) {
        this.balances[t.account] = 0;
      }

      if (t.type === "Income") {
        this.balances[t.account] += amount;
      } else {
        this.balances[t.account] -= amount;
      }

      
      if (
        t.type === "Expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        this.monthlyExpense += amount;
      }
    });

    
    this.balanceList = accounts.map((acc) => ({
      name: acc.name,
      value: this.balances[acc.name],
      color: acc.color || "blue", 
    }));
  }

  deleteAccount(name: string) {

  const transactions = this.transactionService.getTransactions();

  const used = transactions.some((t: any) => t.account === name);

  if (used) {
    alert('Cannot delete account with transactions');
    return;
  }

  const confirmDelete = confirm(`Delete ${name}?`);

  if (!confirmDelete) return;

  this.transactionService.deleteAccount(name);
}
}
