import { Component } from "@angular/core";
import { TransactionService } from "../transaction.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

interface Account {
  name: string;
  balance: number;
  color: string;
}

interface Transaction {
  amount: number;
  type: string;
  category: string;
  account: string;
  notes: string;
  date: string;
}
@Component({
  selector: "app-account-manager",
  imports: [FormsModule, CommonModule],
  templateUrl: "./account-manager.component.html",
  styleUrl: "./account-manager.component.scss",
})
export class AccountManagerComponent {
  name: string = "";
  balance: number = 0;
  accounts: any[] = [];
  bankOptions: string[] = ["HDFC", "Canara", "SBI", "ICICI", "Other"];

  selectedBank: string = "";
  customBankName: string = "";

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.accounts$.subscribe((data) => {
      this.accounts = data;
    });
  }

  addAccount() {
    const accounts = this.transactionService.getAccounts();

    // 🔒 Limit to 3 accounts
    if (accounts.length >= 3) {
      alert("Maximum 3 accounts allowed");
      return;
    }

    // 🎯 Determine final account name
    let finalName = "";

    if (this.selectedBank === "Other") {
      finalName = this.customBankName.trim();
    } else {
      finalName = this.selectedBank;
    }

    if (!finalName) return;

    const exists = accounts.some(
      (acc: Account) => acc.name.toLowerCase() === finalName.toLowerCase(),
    );

    if (exists) {
      alert("Account already exists");
      return;
    }

    // 🎨 Assign stable color
    const colors = ["blue", "green", "purple"];

    const account = {
      name: finalName,
      balance: Number(this.balance),
      color: colors[accounts.length], // 🔥 stable color assignment
    };

    // 💾 Save account
    this.transactionService.addAccount(account);

    // 🔄 Reset form
    this.selectedBank = "";
    this.customBankName = "";
    this.balance = 0;
  }

  deleteAccount(name: string) {

  const transactions = this.transactionService.getTransactions();

  const used = transactions.some((t: Transaction) => t.account === name);

  if (used) {
    alert('Cannot delete account with transactions');
    return;
  }

  const confirmDelete = confirm(`Delete ${name} account?`);

  if (!confirmDelete) return;

  this.transactionService.deleteAccount(name);
}
}
