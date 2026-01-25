import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Donor } from './donor';

describe('Donor', () => {
  let component: Donor;
  let fixture: ComponentFixture<Donor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Donor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
