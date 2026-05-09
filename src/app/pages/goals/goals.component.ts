import { Component } from '@angular/core';
import { Goal, TransactionService } from '../../transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-goals',
  imports: [FormsModule, CommonModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
})
export class GoalsComponent {
  goals: Goal[] = [];

  showModal = false;

  newTitle = '';

  newTarget = 0;

  newColor = '#4d7cff';

  savingsAmount: {
    [key: string]: number;
  } = {};

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.goals = this.transactionService.getGoals();
  }

  getProgress(saved: number, target: number) {
    return (saved / target) * 100;
  }

  addGoal() {
    if (!this.newTitle || this.newTarget <= 0) {
      return;
    }

    this.transactionService.addGoal({
      title: this.newTitle,

      target: this.newTarget,

      saved: 0,

      color: this.newColor,
    });

    this.loadGoals();

    this.newTitle = '';

    this.newTarget = 0;

    this.newColor = '#4d7cff';

    this.showModal = false;
  }

  deleteGoal(title: string) {
    this.transactionService.deleteGoal(title);

    this.loadGoals();
  }

  addSavings(goal: Goal) {
    const amount = this.savingsAmount[goal.title];

    if (!amount || amount <= 0) {
      return;
    }

    this.transactionService.addSavingsToGoal(goal.title, amount);

    this.savingsAmount[goal.title] = 0;

    this.loadGoals();
  }
}
