import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthHttpService } from './auth-http.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private fb: FormBuilder, private auth: AuthService, private apiAuth: AuthHttpService, private router: Router) { }

  @ViewChild('googleBtn', { static: true }) googleBtn!: ElementRef<HTMLDivElement>;

  form!: FormGroup;
  showPassword = false;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit() {
    this.auth.renderGoogleButton(this.googleBtn.nativeElement, undefined, 'sign_in');
    this.auth.googleCredential$.subscribe(() => {
      // After successful Google credential, navigate to dashboard
      this.router.navigateByUrl('/dashboard');
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.apiAuth.login({ email, password }).subscribe({
      next: () => this.router.navigateByUrl('/dashboard')
      // Errors are handled by the auth interceptor + toast
    });
  }
}