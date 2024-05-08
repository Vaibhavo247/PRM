import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RegisterService } from '../Services/register.service';
import { Router } from '@angular/router';
 // Assuming your service is in a separate file

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private registerService: RegisterService,private router:Router) {}

  ngOnInit() {
    // this.forgotPasswordForm = this.fb.group({
    //   email: ['',Validators.compose([Validators.required,Validators.pattern(/^.*@manappuram\.com$/)])],
    // });
    this.forgotPasswordForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(/^.*@manappuram\.com$/)])],
    } as unknown as { email: string }); // Add type assertion
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    this.registerService.forgotPassword(email)
      .subscribe(
        (response) => {
          console.log('Password reset request successful:', response);
          this.errorMessage = 'Password reset instructions sent to your email.';
          this.forgotPasswordForm.reset(); // Clear the form after successful request
          
        },
        (error) => {
          console.error('Error sending password reset request:', error);
          alert('something went wrong');
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      );
  }
}
