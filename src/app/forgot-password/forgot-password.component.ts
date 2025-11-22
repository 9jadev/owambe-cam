import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    form!: FormGroup;
    submitted = false;

    constructor(private fb: FormBuilder, private router: Router) { }

    ngOnInit() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    submit() {
        if (this.form.invalid) return;

        // Stub: Send password reset email
        console.log('Password reset email sent to:', this.form.value.email);
        this.submitted = true;

        // After 3 seconds, redirect to login
        setTimeout(() => {
            this.router.navigateByUrl('/login');
        }, 3000);
    }
}
