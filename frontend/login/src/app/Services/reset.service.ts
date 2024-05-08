import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResetService {

  constructor(private http:HttpClient) { }
  forgotPassword(email: string): void {

    this.http.post(`http://localhost:3000/forgot-password`, { email }).subscribe();

  }
  verifyCode(email: string, code: string): void {
    this.http.post(`http://localhost:3000/verify-code`, { email, code }).subscribe();
  }
  resetPassword(email: string, password: string): void {

    this.http.post(`http://loalhost:3000/reset-password`, { email, password }).subscribe();
  
  }
}

