import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface AuthRepsonse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.signinForm.valid) {
      const formData = this.signinForm.value;
      console.log('Form data: ', formData);

      this.http
        .post<AuthRepsonse>(
          'http://localhost:5500/api/v1/auth/sign-in',
          formData,
        )
        .subscribe({
          next: (response) => {
            console.log('Success: ', response);
            localStorage.setItem('token', response?.data?.token);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error: ', error);
          },
        });
    } else {
      console.log('Form is invalid');
      this.signinForm.markAllAsTouched();
    }
  }
}
