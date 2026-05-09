import { Component } from "@angular/core";

import { Goal, TransactionService } from "../../transaction.service";

import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-goals",

  imports: [FormsModule, CommonModule],

  templateUrl: "./goals.component.html",

  styleUrl: "./goals.component.scss",
})
export class GoalsComponent {
  goals: any[] = [];

  showModal = false;

  newTitle = "";

  newTarget = 0;

  newColor = "#4d7cff";

  newLinkedCategory = "";

  newLinkedAccount = "";

  accounts: any[] = [];

  categories: string[] = [];

  presetColors = [
    "#2b6fff",
    "#20d997",
    "#ffb020",
    "#ff4d57",
    "#a855f7",
    "#f97316",
  ];

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.accounts = this.transactionService.getAccounts();

    this.loadGoals();

    // REACTIVE UPDATES

    this.transactionService.transactions$.subscribe(() => {
      this.loadGoals();
    });

    this.categories = this.transactionService.getCategories();
  }

  loadGoals() {
    const goals = this.transactionService.getGoals();

    const transactions = this.transactionService.getTransactions();

    this.goals = goals.map((goal: any) => {
      let saved = 0;

      // CATEGORY-BASED TRACKING

      transactions.forEach((t: any) => {
        if (t.category === goal.linkedCategory) {
          saved += Number(t.amount);
        }
      });

      return {
        ...goal,

        saved,
      };
    });
  }

  getProgress(saved: number, target: number) {
    return (saved / target) * 100;
  }

  addGoal() {
    if (!this.newTitle || !this.newLinkedCategory || this.newTarget <= 0) {
      return;
    }

    this.transactionService.addGoal({
      title: this.newTitle,

      target: this.newTarget,

      linkedCategory: this.newLinkedCategory,

      linkedAccount: this.newLinkedAccount,

      color: this.newColor,
    });

    this.loadGoals();

    // RESET

    this.newTitle = "";

    this.newTarget = 0;

    this.newColor = "#4d7cff";

    this.newLinkedCategory = "";

    this.newLinkedAccount = "";

    this.showModal = false;
  }

  deleteGoal(title: string) {
    this.transactionService.deleteGoal(title);

    this.loadGoals();
  }
}
