import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftsList } from './gifts-list';

describe('GiftsList', () => {
  let component: GiftsList;
  let fixture: ComponentFixture<GiftsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
