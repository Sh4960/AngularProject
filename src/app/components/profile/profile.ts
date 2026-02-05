import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  authSrv = inject(AuthService);
  userSrv = inject(UserService);

  userId: number = 0;
  userName: string = '';
  userEmail: string = '';
  phone: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMsg: string = '';
  successMsg: string = '';
  isEditing: boolean = false;

  ngOnInit() {
    this.userId = this.authSrv.getUserIdFromToken();
    if (this.userId > 0) {
      this.loadUserInfo();
    } else {
      this.errorMsg = 'משתמש לא מחובר';
    }
  }

  loadUserInfo() {
    // קבלת פרטי המשתמש מהשרת
    this.userSrv.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userName = user.userName || '';
        this.userEmail = user.email || '';
        this.phone = user.phone || '';
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.errorMsg = 'שגיאה בטעינת פרטי המשתמש';
      }
    });
  }

  updateProfile() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.userName || !this.userEmail || !this.phone) {
      this.errorMsg = 'יש למלא את כל השדות הנדרשים';
      return;
    }

    // אם מילאה סיסמה, בדוק שהן תואמות
    if (this.newPassword || this.confirmPassword) {
      if (!this.newPassword || !this.confirmPassword) {
        this.errorMsg = 'יש למלא את שני שדות הסיסמה';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMsg = 'הסיסמאות אינן תואמות';
        return;
      }
    }

    const updatedUser: any = {
      userName: this.userName,
      email: this.userEmail,
      phone: this.phone
    };

    // אם מילאה סיסמה חדשה, הוסף אותה
    if (this.newPassword) {
      updatedUser.password = this.newPassword;
    }

    this.userSrv.updateProfile(this.userId, updatedUser).subscribe({
      next: () => {
        this.successMsg = 'הפרטים עודכנו בהצלחה!';
        this.isEditing = false;
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        let errorMessage = 'שגיאה בעדכון הפרטים';
        
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.errors && Array.isArray(err.error.errors)) {
          const errorMessages = err.error.errors.map((e: any) => 
            typeof e === 'object' && e.message ? e.message : JSON.stringify(e)
          );
          errorMessage = errorMessages.join(' | ');
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else {
          errorMessage = JSON.stringify(err.error);
        }
        
        this.errorMsg = errorMessage;
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMsg = '';
    this.successMsg = '';
    this.loadUserInfo();
  }
}