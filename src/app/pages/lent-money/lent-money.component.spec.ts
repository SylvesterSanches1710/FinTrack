import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LentMoneyComponent } from './lent-money.component';

describe('LentMoneyComponent', () => {
  let component: LentMoneyComponent;
  let fixture: ComponentFixture<LentMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LentMoneyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LentMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
