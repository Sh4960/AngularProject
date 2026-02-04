import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss']
})
export class UsersList {

  userSrv = inject(UserService);
  
  users$: Observable<any[]> = this.userSrv.getAllUsers();
  errorMsg: string = '';

  // טעינת רשימת משתמשים
  loadUsers() {
    this.users$ = this.userSrv.getAllUsers();
  }
}