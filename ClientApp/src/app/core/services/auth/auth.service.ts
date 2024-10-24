import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/enviroment';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  getVerificationCode(requestBody: { login: string; token: string | null }) {
    return this.http
      .post(
        `${environment.ApiUrl}/api/v1.0/auth/login/by-code/sms/check/init`,
        requestBody, {
          observe: 'response',
        }
      )
  };

  sendVerificationCode(phoneNumber: string, code: string) {
    const params = new HttpParams()
      .set('grant_type', environment.auth.grantTypeAccess)
      .set('client_secret', environment.auth.client_secret)
      .set('client_id', environment.auth.clientId)
      .set('redirect_uri', environment.auth.redirectUri)
      .set('username', phoneNumber)
      .set('secret_code', code)
      .set('scope', environment.auth.scope)

    return this.http
      .post(`${environment.ApiUrl}/token`, params, {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response: any) => {
          this.storeTokens(response);
          return response;
        })
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.cookieService.get('refresh_token');
    if (!refreshToken) {
      return throwError('Отсутствует refresh_token');
    }

    const body = new HttpParams()
      .set('grant_type', environment.auth.grantTypeRefresh)
      .set('client_id', environment.auth.clientId)
      .set('refresh_token', refreshToken)
      .set('redirect_uri', environment.auth.redirectUri);

    return this.http
      .post(`${environment.ApiUrl}/token`, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response: any) => {
          this.storeTokens(response);
          return response;
        })
      );
  }

  private storeTokens(response: any): void {
    const expiresIn = response.expires_in || 600;
    this.setToken('access_token', response.access_token, expiresIn);
    this.setToken('refresh_token', response.refresh_token);
  }

  private setToken(name: string, token: string, expiresIn?: number): void {
    if (expiresIn) {
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
      this.cookieService.set(name, token, {
        path: '/',
        expires: expirationDate,
      });
    } else {
      this.cookieService.set(name, token, { path: '/' });
    }
  }

  getToken(): string | null {
    const token = this.cookieService.get('access_token');
    return token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(): Observable<any> {
    const params = new HttpParams()
      .set('response_type', 'code')
      .set('client_id', environment.auth.clientId)
      .set('redirect_uri', environment.auth.redirectUri)
      .set('scope', environment.auth.scope);

    return this.http.get(`${environment.ApiUrl}/authorize`, { params });
  }

  logout() {
    this.cookieService.delete('access_token');
    this.cookieService.delete('refresh_token');
  }
}
