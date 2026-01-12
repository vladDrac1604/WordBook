import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTheWordDialogComponent } from './add-the-word-dialog.component';

describe('AddTheWordDialogComponent', () => {
  let component: AddTheWordDialogComponent;
  let fixture: ComponentFixture<AddTheWordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTheWordDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTheWordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
