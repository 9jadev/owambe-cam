import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

declare global {
  interface Window { google?: any }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private googleScriptLoaded = false;

  googleCredential$ = new Subject<string>();

  private getClientIdFromMeta(): string | undefined {
    if (!this.isBrowser) return undefined;
    const el = document.querySelector('meta[name="google-client-id"]') as HTMLMetaElement | null;
    return el?.content || undefined;
  }

  async loadGoogleScript(): Promise<void> {
    if (!this.isBrowser) return;
    if (this.googleScriptLoaded) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => { this.googleScriptLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  async renderGoogleButton(container: HTMLElement, clientId?: string, type: 'sign_in' | 'sign_up' = 'sign_in') {
    if (!this.isBrowser) return;
    await this.loadGoogleScript();
    const cid = clientId || this.getClientIdFromMeta();
    if (!cid || !(window as any).google) {
      container.innerHTML = '<div class="text-sm text-red-600">Google client ID not set.</div>';
      return;
    }
    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: cid,
      callback: (response: any) => {
        if (response?.credential) this.googleCredential$.next(response.credential);
      },
      ux_mode: 'popup',
      auto_select: false,
      context: type,
    });
    google.accounts.id.renderButton(container, {
      type,
      theme: 'outline',
      size: 'large',
      shape: 'rect',
      text: type === 'sign_up' ? 'signup_with' : 'signin_with',
    });
    // Optionally show One Tap prompt
    // google.accounts.id.prompt();
  }
}