import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { RegisterService } from '../Services/register.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  host: {ngSkipHydration: 'true'},

})
export class LoginPageComponent implements OnInit {
  loginform!: FormGroup;
  errorMessage: string = '';
  constructor(private fb:FormBuilder,private router:Router,private register:RegisterService){}
  ngOnInit(): void {
    this.loginform = this.fb.group({
      'username':['',Validators.required],
  'password':['',Validators.compose([Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/)])]
    });
  }
  onSubmit(): void {
    if (this.loginform.valid) {
      const username = this.loginform.value.username;
      const password = this.loginform.value.password;
      const loginData = { username, password };
       // Call the login method from your service
      this.register.login(loginData).subscribe((response:any) => {
        console.log('Login Sucessful:',response);
      this.router.navigate(['/home']);
      alert('sucessfully login')
      },(error:any) => {
        //handle login error
        alert('username or password incorrect')
        console.error('Login Error:',error);
      this.loginform.reset();
        this.errorMessage = this.handleLoginError(error); // Handle errors more informatively
      }
      );
    }else {
      console.log('Login failed');
      this.errorMessage = 'Please check your credentials'; // More specific error message
    }
  }private handleLoginError(error: any): string {
    if (error.status === 401) {
      if (error.error.message === 'user not found') {
        return 'User not registered. Please register first.';
      } else {
        return 'Invalid username or password.';
      }
    } else {
      return 'An error occurred while logging in. Please try again later.';
    }
  }
  }
        
       