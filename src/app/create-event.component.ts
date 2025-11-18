import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
        private router: Router
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

        const eventData = this.eventForm.value;
        console.log('Creating event:', eventData);

        // Stub: Save to backend
        // After successful creation, navigate to the new event
        this.router.navigateByUrl('/dashboard/event');
    }

    cancel() {
        this.router.navigateByUrl('/dashboard');
    }
}
