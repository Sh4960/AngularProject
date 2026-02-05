import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shoppings } from './shoppings';
import { CommonModule } from '@angular/common';

describe('Shoppings', () => {
  let component: Shoppings;
  let fixture: ComponentFixture<Shoppings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shoppings, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Shoppings);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
