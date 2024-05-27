import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http:HttpClient) { }
  registerUser(user:any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const jsonData = JSON.stringify(user);
    console.log(jsonData);
    
    return this.http.post<any>('http://localhost:3000/api/register', jsonData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  login(User:any){
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    const json = JSON.stringify(User)
    console.log(json);
    return this.http.post<any>('http://localhost:3000/api/login', json, {headers})
    .pipe(
      catchError(this.handleError)
    );
}
forgotPassword(email: string) {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  const jsonData = JSON.stringify({ email });
  return this.http.post<any>('http://localhost:3000/api/forgot-password', jsonData, { headers })
    .pipe(
      catchError(this.handleError)
    );
}
  resetPassword(token: string, newPassword: string, confirmPassword: string):Observable <any> {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  const jsonData = JSON.stringify({ token, newPassword, confirmPassword });
  return this.http.post<any>('http://localhost:3000//api/reset-password', jsonData, { headers })
    .pipe(
      catchError(this.handleError)
    );
}


saveMeetingData(data: any) {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  const jsonData = JSON.stringify(data);
  console.log(jsonData);
  
  return this.http.post<any>('http://localhost:3000/api/save-meeting', jsonData, { headers })
    .pipe(
      catchError(this.handleError)
    );
}
getData(): Observable<Blob> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return this.http.get('http://localhost:3000/api/export-meetings', {
    responseType: 'blob',
    headers: headers
  }).pipe(
    catchError(this.handleError)
  );
}
getProducts(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/data');
}
validateToken(token: string, email: string): Observable<any> {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  const jsonData = JSON.stringify({ token, email });

  return this.http.post<any>('http://localhost:3000/api/validate-token', jsonData, { headers })
    .pipe(
      catchError(this.handleError)
    );
}
  
getMeetingDetailsById(meetingId: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`); // Include JWT token

  return this.http.get<any>(`http://localhost:3000/api/get-meeting-by-id/${meetingId}`, { headers })
    .pipe(
      catchError(this.handleError)
    );
}
private handleError(error: HttpErrorResponse) {
  console.error(
    `Backend returned code ${error.status}, body was: ${error.error}`);
  return throwError('Something bad happened; please try again later.');
}
}
