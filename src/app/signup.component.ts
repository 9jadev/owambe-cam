import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AuthHttpService } from './services/auth-http.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  constructor(private fb: FormBuilder, private auth: AuthService, private apiAuth: AuthHttpService, private router: Router) { }

  @ViewChild('googleBtn', { static: true }) googleBtn!: ElementRef<HTMLDivElement>;

  form!: FormGroup;
  showPassword = false;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit() {
    this.auth.renderGoogleButton(this.googleBtn.nativeElement, undefined, 'sign_up');
    this.auth.googleCredential$.subscribe(() => {
      this.router.navigateByUrl('/dashboard');
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { name, email, password } = this.form.value;
    this.apiAuth.signup({ name, email, password }).subscribe({
      next: () => this.router.navigateByUrl('/dashboard')
    });
  }
}