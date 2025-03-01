import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancesTrendsComponent } from './finances-trends.component';

describe('FinancesTrendsComponent', () => {
  let component: FinancesTrendsComponent;
  let fixture: ComponentFixture<FinancesTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancesTrendsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinancesTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
