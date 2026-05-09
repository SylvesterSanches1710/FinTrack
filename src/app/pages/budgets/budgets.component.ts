import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-budgets',
  imports: [CommonModule, FormsModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent {
  budgets: any[] = [];
  showBudgetModal = false;

  newTitle = '';

  selectedCategories: string[] = [];

  newPeriod = 'Monthly';

  isRecurring = true;

  newLimit = 0;

  newColor = '#4d7cff';

  categories: string[] = [];

  getProgress(spent: number, limit: number) {
    return (spent / limit) * 100;
  }
  addBudget() {
    if (
      !this.newTitle ||
      this.selectedCategories.length === 0 ||
      this.newLimit <= 0
    ) {
      return;
    }

    this.transactionService.addBudget({
      title: this.newTitle,

      categories: this.selectedCategories,

      limit: this.newLimit,

      period: this.newPeriod,

      recurring: this.isRecurring,

      color: this.newColor,
    });

    this.refreshBudgets();

    // RESET

    this.newTitle = '';

    this.selectedCategories = [];

    this.newLimit = 0;

    this.newPeriod = 'Monthly';

    this.isRecurring = true;

    this.newColor = '#4d7cff';

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
          // ONLY EXPENSES

          if (t.type !== 'Expense') {
            return false;
          }

          // CATEGORY MATCH

          const matchesCategory = budget.categories.includes(t.category);

          if (!matchesCategory) {
            return false;
          }

          const transactionDate = new Date(t.date);

          const now = new Date();

          // DAILY

          if (budget.period === 'Daily') {
            return transactionDate.toDateString() === now.toDateString();
          }

          // WEEKLY

          if (budget.period === 'Weekly') {
            const startOfWeek = new Date(now);

            startOfWeek.setDate(now.getDate() - now.getDay());

            return transactionDate >= startOfWeek;
          }

          // YEARLY

          if (budget.period === 'Yearly') {
            return transactionDate.getFullYear() === now.getFullYear();
          }

          // MONTHLY DEFAULT

          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        })

        .reduce(
          (
            sum: number,

            t: any,
          ) => sum + t.amount,

          0,
        );

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

    this.categories = this.transactionService.getCategories();

    this.transactionService.categories$.subscribe((data) => {
      this.categories = data;
    });
  }
  toggleCategory(category: string) {
    const exists = this.selectedCategories.includes(category);

    // REMOVE

    if (exists) {
      this.selectedCategories = this.selectedCategories.filter(
        (c) => c !== category,
      );
    }

    // ADD
    else {
      this.selectedCategories.push(category);
    }
  }
}
