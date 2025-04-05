import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    userRole: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;

      console.log('Form data:', formData);

      this.signupForm.reset();

      this.http
        .post('http://localhost:5500/api/v1/auth/sign-up', formData)
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
      this.signupForm.markAllAsTouched();
    }
  }
}
