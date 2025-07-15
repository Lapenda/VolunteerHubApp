import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { catchError, switchMap, tap } from 'rxjs/operators';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5500/api/v1';
  private userSubject = new BehaviorSubject<User | null>(null);
  private user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchCurrentUser().subscribe({
        next: (user) => this.setCurrentUser(user),
        error: (error) => {
          console.error('Failed to fetch user on initialization', error);
          if (error.status === 401) {
            localStorage.removeItem('token');
            this.router.navigate(['/sign-in']);
          }
        },
      });
    }
  }

  /* private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.userId || null;
    } catch {
      return null;
    }
  } */

  login(credentials: SignInDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/sign-in`, credentials)
      .pipe(
        tap((response) =>
          console.log(
            'JWT Payload:',
            JSON.parse(atob(response.data.token.split('.')[1])),
          ),
        ),
      );
  }

  fetchCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return of(null);
    return this.http
      .get<{ success: boolean; data: User }>(`${this.apiUrl}/users/me`)
      .pipe(
        switchMap((response) => of(response.data)),
        catchError(() => {
          localStorage.removeItem('token');
          return of(null);
        }),
      );
  }

  signup(data: SignUpDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/sign-up`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.router.navigate(['/sign-in']);
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  setCurrentUser(user: User | null) {
    this.userSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
