import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { RegisterService } from '../Services/register.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // Import for conditional check
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  errorMessage: string = '';
  token!: string;
  email!: string | null; // Store the reset token from the URL parameter

  constructor(
    private fb: FormBuilder,
    private resetService: RegisterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      email:['',Validators.compose([Validators.required,Validators.pattern(/^.*@manappuram\.com$/)])],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // Extract token and email from URL parameters
    this.token = this.activatedRoute.snapshot.queryParams['token'];
    this.email = this.activatedRoute.snapshot.queryParams['email'];

    // Validate token on initialization (optional)
    // this.validateToken(); // Uncomment if immediate validation is needed
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { notMatching: true };
    }

    return null;
  }

  validateToken() {
    if (!this.token || !this.email) {
      // Handle missing token or email scenario (e.g., display error message)
      return;
    }

    // Implement logic to validate the token with the backend API (e.g., service call)
    this.resetService.validateToken(this.token, this.email)
      .subscribe(
        (response) => {
          console.log('Token valid:', response);
          // Token is valid, proceed with password reset form
        },
        (error) => {
          console.error('Error validating token:', error);
          this.errorMessage = 'Invalid token or link expired. Please request a new password reset.';
        }
      );
  }

//   onSubmit() {
//     if (this.resetPasswordForm.valid) {
//       console.log("form value", this.resetPasswordForm.value);
//       return;
//     }

//     const newPassword = this.resetPasswordForm.value.password;
//     const confirmPassword = this.resetPasswordForm.value.confirmPassword;

//     if (!this.token || !this.email) {
//       // Handle missing token or email scenario (e.g., display error message)
//       return;
//     }

//     this.resetService.resetPassword(this.token, newPassword, confirmPassword)
//       .subscribe(
//         (response) => {
//           console.log('Password reset successful:', response);
//           this.errorMessage = 'Password reset successful!';
//           this.resetPasswordForm.reset();
//           this.router.navigate(['/login']); // Redirect to login page after successful reset
//         },
//         (error) => {
//           console.error('Error resetting password:', error);
//           this.errorMessage = 'An error occurred. Please try again later.';
//         }
//       );
//   }
// }
onSubmit() {
  if (this.resetPasswordForm.valid) {
    const newPassword = this.resetPasswordForm.value.password;
    const confirmPassword = this.resetPasswordForm.value.confirmPassword;
    const token = this.resetPasswordForm.value.token; // Assuming you store token in the form
    const email = this.resetPasswordForm.value.email; // Assuming you store email in the form

    this.resetService.resetPassword(token,newPassword, confirmPassword)
      .subscribe(
        (response) => {
          console.log('Password reset successful:', response);
          this.errorMessage = 'Password reset successful!';
          this.resetPasswordForm.reset();
          this.router.navigate(['/login']); // Redirect to login page after successful reset
        },
        (error) => {
          console.error('Error resetting password:', error);
          this.errorMessage = 'An error occurred. Please try again later.';
          // Handle specific errors based on the error response (e.g., invalid token, expired token)
        }
      );
  }
}
}