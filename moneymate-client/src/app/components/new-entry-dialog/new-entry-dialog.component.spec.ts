import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEntryDialogComponent } from './new-entry-dialog.component';

describe('NewEntryDialogComponent', () => {
  let component: NewEntryDialogComponent;
  let fixture: ComponentFixture<NewEntryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEntryDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewEntryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
