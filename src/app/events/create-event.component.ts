import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsHttpService } from '../services/events-http.service';

type EventType = 'wedding' | 'party' | 'conference' | 'birthday' | 'other';

@Component({
    standalone: true,
    selector: 'app-create-event',
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './create-event.component.html',
    styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent {
    eventForm: FormGroup;
    selectedEventType: EventType = 'conference';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private eventsApi: EventsHttpService
    ) {
        this.eventForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            date: ['', Validators.required],
            type: ['conference', Validators.required]
        });
    }

    setEventType(type: EventType) {
        this.selectedEventType = type;
        this.eventForm.patchValue({ type });
    }

    createEvent() {
        if (this.eventForm.invalid) {
            Object.keys(this.eventForm.controls).forEach(key => {
                this.eventForm.get(key)?.markAsTouched();
            });
            return;
        }

        const { name, date, type } = this.eventForm.value as { name: string; date: string; type: string };
        const payload = { name, date, type };

        this.eventsApi.createEvent(payload).subscribe({
            next: (res) => {
                // Navigate to dashboard or the created event route if provided
                this.router.navigateByUrl('/dashboard');
            },
            error: () => {
                // Errors are handled by interceptor and toast; keep user on form
            }
        });
    }

    cancel() {
        this.router.navigateByUrl('/dashboard');
    }
}
