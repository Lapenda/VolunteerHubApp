import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SignUpDto } from '../../../core/dtos/sign-up.dto';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  signupForm = new FormGroup({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    userRole: new FormControl<string>('', [Validators.required]),
    associationName: new FormControl<string>(''),
    associationContact: new FormControl<string>(''),
    skills: new FormControl<string>(''),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.signupForm.valid) {
      const formData: SignUpDto = {
        name: this.signupForm.value.name!,
        email: this.signupForm.value.email!,
        password: this.signupForm.value.password!,
        userRole: this.signupForm.value.userRole as
          | 'volunteer'
          | 'organization',
      };
      if (formData.userRole === 'organization') {
        formData.association = {
          name: this.signupForm.value.associationName!,
          contact: this.signupForm.value.associationContact!,
        };
      } else if (formData.userRole === 'volunteer') {
        formData.skills =
          this.signupForm.value.skills?.split(',').map((s) => s.trim()) || [];
      }
      this.authService.signup(formData).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.data.token);
          this.authService.setCurrentUser(response.data.user);
          this.router.navigate(['/']);
        },
        error: (error) => console.error('Signup error:', error),
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
