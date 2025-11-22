import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

type BodyOptions = {
  headers?: HttpHeaders;
  params?: HttpParams;
  reportProgress?: boolean;
  observe?: 'body';
  responseType?: 'json';
  withCredentials?: boolean;
};

@Injectable({ providedIn: 'root' })
export class BackendService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private resolve(path: string): string {
    if (!path) return this.baseUrl;
    // Allow absolute URLs to pass through
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  jsonOptions(extra?: { headers?: HttpHeaders }): { headers: HttpHeaders; observe: 'body'; responseType: 'json' } {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    const extraHeaders = extra?.headers;
    if (extraHeaders) {
      // Merge headers if provided
      extraHeaders.keys().forEach((key) => {
        const val = extraHeaders.get(key);
        if (val) {
          headers = headers.set(key, val);
        }
      });
    }
    return { headers, observe: 'body', responseType: 'json' };
  }

  get<T>(path: string, options?: BodyOptions): Observable<T> {
    const opts: BodyOptions = { observe: 'body', responseType: 'json', ...(options || {}) };
    return this.http.get<T>(this.resolve(path), opts);
  }

  post<T>(path: string, body: any, options?: BodyOptions): Observable<T> {
    const opts: BodyOptions = { observe: 'body', responseType: 'json', ...(options || {}) };
    return this.http.post<T>(this.resolve(path), body, opts);
  }

  put<T>(path: string, body: any, options?: BodyOptions): Observable<T> {
    const opts: BodyOptions = { observe: 'body', responseType: 'json', ...(options || {}) };
    return this.http.put<T>(this.resolve(path), body, opts);
  }

  delete<T>(path: string, options?: BodyOptions): Observable<T> {
    const opts: BodyOptions = { observe: 'body', responseType: 'json', ...(options || {}) };
    return this.http.delete<T>(this.resolve(path), opts);
  }
}