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

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
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
    userRole: new FormControl('', Validators.required),
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
        .post('http://localhost:5500/api/v1/auth/sign-in', formData)
        .subscribe({
          next: (response) => {
            console.log('Success: ', response);
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
