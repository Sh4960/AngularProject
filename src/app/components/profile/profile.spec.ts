import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile, FormsModule, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
