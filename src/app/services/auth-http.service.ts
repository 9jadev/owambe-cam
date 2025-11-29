import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { ToastService } from './toast.service';
import { BackendService } from './backend.service';

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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient, private toast: ToastService, private backend: BackendService) { }
  private customerPath = `/customer`;
  private tokenKey = 'auth.token';
  private expiresKey = 'auth.expiresAt';
  private userKey = 'auth.customer';

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.backend
      .post<AuthResponse>(`${this.customerPath}/signup`, payload, this.backend.jsonOptions())
      .pipe(
        tap((res: AuthResponse) => {
          this.setToken(res.token, res.expires_in);
          if (res.customer && this.isBrowser) {
            localStorage.setItem(this.userKey, JSON.stringify(res.customer));
          }
          this.toast.success(res.message || 'Signup successful');
        })
      );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.backend
      .post<AuthResponse>(`${this.customerPath}/login`, payload, this.backend.jsonOptions())
      .pipe(
        tap((res: AuthResponse) => {
          this.setToken(res.token, res.expires_in);
          this.toast.success((res.message as string) || 'Login successful');
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    // Assumes backend provides refresh endpoint. Adjust path if different.
    return this.backend.post<AuthResponse>(`${this.customerPath}/refresh`, {}).pipe(
      tap((res: AuthResponse) => {
        this.setToken(res.token, res.expires_in);
        this.toast.info('Session refreshed');
      })
    );
  }

  // Fetch current authenticated customer profile
  getMe(): Observable<Customer> {
    return this.backend.get<MeResponse>(`${this.customerPath}/me`).pipe(
      map((res: MeResponse) => res.customer),
      tap((customer: Customer) => {
        if (this.isBrowser) {
          localStorage.setItem(this.userKey, JSON.stringify(customer));
        }
        this.toast.info('Profile updated');
      })
    );
  }

  getWithToken<T>(url: string): Observable<T> {
    // Accept absolute URLs too
    return this.backend.get<T>(url);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getTokenExpiry(): number | null {
    if (!this.isBrowser) return null;
    const v = localStorage.getItem(this.expiresKey);
    return v ? Number(v) : null;
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiry();
    if (!exp) return true;
    return Date.now() >= exp;
  }

  clearToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.userKey);
  }

  // Read the last stored customer from localStorage
  getStoredCustomer(): Customer | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? (JSON.parse(raw) as Customer) : null;
    } catch {
      return null;
    }
  }

  private setToken(token: string, expiresInSeconds: number): void {
    if (!this.isBrowser) return;
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiresKey, String(expiresAt));
  }
}
