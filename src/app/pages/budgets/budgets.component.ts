import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TransactionService } from "../../transaction.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-budgets",
  imports: [CommonModule, FormsModule],
  templateUrl: "./budgets.component.html",
  styleUrl: "./budgets.component.scss",
})
export class BudgetsComponent {
  budgets: any[] = [];
  showBudgetModal = false;

  newCategory = "";

  newLimit = 0;

  newColor = "#4d7cff";

  categories = [
    "Restaurant",

    "Fuel",

    "Bills",

    "Shopping",

    "Investment",

    "Entertainment",

    "Transfer",
  ];

  getProgress(spent: number, limit: number) {
    return (spent / limit) * 100;
  }
  addBudget() {
    if (!this.newCategory || this.newLimit <= 0) {
      return;
    }

    this.transactionService.addBudget({
      category: this.newCategory,

      limit: this.newLimit,

      color: this.newColor,
    });

    this.refreshBudgets();

    this.newCategory = "";

    this.newLimit = 0;

    this.newColor = "#4d7cff";

    this.showBudgetModal = false;
  }

  deleteBudget(category: string) {
    this.transactionService.deleteBudget(category);

    this.refreshBudgets();
  }

  refreshBudgets() {
    const transactions = this.transactionService.getTransactions();

    const budgets = this.transactionService.getBudgets();

    this.budgets = budgets.map((budget: any) => {
      const spent = transactions
        .filter((t: any) => {
          const transactionDate = new Date(t.date);

          const currentDate = new Date();

          const sameMonth =
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear();

          return (
            t.category?.trim().toLowerCase() ===
              budget.category?.trim().toLowerCase() &&
            t.type === "Expense" &&
            sameMonth
          );
        })

        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return {
        ...budget,

        spent,
      };
    });
  }
  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.refreshBudgets();

    this.transactionService.transactions$.subscribe(() => {
      this.refreshBudgets();
    });
  }
}
