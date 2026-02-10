import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftPurchasers } from './gift-purchasers';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GiftPurchasers', () => {
  let component: GiftPurchasers;
  let fixture: ComponentFixture<GiftPurchasers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftPurchasers, CommonModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GiftPurchasers);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
