import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { ToastService } from './toast.service';
import { environment } from '../environments/environment';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  token_type: 'bearer';
  expires_in: number; // seconds
  customer?: Customer;
}

export interface MeResponse {
  message: string;
  customer: Customer;
}

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  constructor(private http: HttpClient, private toast: ToastService) {}
  private apiBaseUrl = environment.apiBaseUrl;
  private customerUrl = `${this.apiBaseUrl}/customer`;
  private tokenKey = 'auth.token';
  private expiresKey = 'auth.expiresAt';
  private userKey = 'auth.customer';

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.customerUrl}/signup`, payload, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      })
      .pipe(
        tap((res: AuthResponse) => {
          this.setToken(res.token, res.expires_in);
          if (res.customer) localStorage.setItem(this.userKey, JSON.stringify(res.customer));
          this.toast.success(res.message || 'Signup successful');
        })
      );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.customerUrl}/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        tap((res: AuthResponse) => {
          this.setToken(res.token, res.expires_in);
          this.toast.success((res.message as string) || 'Login successful');
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    // Assumes backend provides refresh endpoint. Adjust path if different.
    return this.http.post<AuthResponse>(`${this.customerUrl}/refresh`, {}).pipe(
      tap((res: AuthResponse) => {
        this.setToken(res.token, res.expires_in);
        this.toast.info('Session refreshed');
      })
    );
  }

  // Fetch current authenticated customer profile
  getMe(): Observable<Customer> {
    return this.http.get<MeResponse>(`${this.customerUrl}/me`).pipe(
      map((res: MeResponse) => res.customer),
      tap((customer: Customer) => {
        localStorage.setItem(this.userKey, JSON.stringify(customer));
        this.toast.info('Profile updated');
      })
    );
  }

  getWithToken<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getTokenExpiry(): number | null {
    const v = localStorage.getItem(this.expiresKey);
    return v ? Number(v) : null;
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiry();
    if (!exp) return true;
    return Date.now() >= exp;
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.userKey);
  }

  // Read the last stored customer from localStorage
  getStoredCustomer(): Customer | null {
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? (JSON.parse(raw) as Customer) : null;
    } catch {
      return null;
    }
  }

  private setToken(token: string, expiresInSeconds: number): void {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiresKey, String(expiresAt));
  }
}