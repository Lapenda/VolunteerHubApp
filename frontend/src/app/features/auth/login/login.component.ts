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
import { SignInDto } from '../../../core/dtos/sign-in.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  signinForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.signinForm.valid) {
      const formData: SignInDto = {
        email: this.signinForm.value.email!,
        password: this.signinForm.value.password!,
      };
      this.authService.login(formData).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.data.token);
          this.authService.setCurrentUser(response.data.user);
          this.router.navigate(['/']);
        },
        error: (error) => console.error('Login error:', error),
      });
    } else {
      this.signinForm.markAllAsTouched();
    }
  }
}
