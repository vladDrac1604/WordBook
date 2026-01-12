import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWordFormComponent } from './add-word-form.component';

describe('AddWordFormComponent', () => {
  let component: AddWordFormComponent;
  let fixture: ComponentFixture<AddWordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWordFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
