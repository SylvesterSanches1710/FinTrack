import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TransactionService } from "./transaction.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent, CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  showOnboarding = false;

  accountName = "";

  accountBalance = 0;
  title = "finance-tracker-angular";

  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  banks = [
    "HDFC Bank",

    "ICICI Bank",

    "Canara Bank",

    "SBI",

    "Axis Bank",

    "Kotak Mahindra",

    "Bank of Baroda",

    "Cash Wallet",
  ];
  selectInput(event: any) {
    event.target.select();
  }

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    const accounts = this.transactionService.getAccounts();

    this.showOnboarding = accounts.length === 0;
  }

  createFirstAccount() {
    if (!this.accountName || this.accountBalance < 0) {
      return;
    }

    this.transactionService.addAccount({
      name: this.accountName,

      balance: this.accountBalance,

      color: "blue",
    });

    this.showOnboarding = false;
  }
}
