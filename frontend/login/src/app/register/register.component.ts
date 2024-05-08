import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../Services/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  host: {ngSkipHydration: 'true'},
})
export class RegisterComponent  implements OnInit {
 
    regForm!: FormGroup;
    errorMessage: string = '';
    roles = ['user', 'admin']; 
    constructor(private fb:FormBuilder,private registerService:RegisterService){}
    ngOnInit(): void {
      this.regForm = this.fb.group({
        username: ['', Validators.required],
        useremail:['',Validators.compose([Validators.required,Validators.pattern(/^.*@manappuram\.com$/)])],
        password:['',Validators.compose([Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/)])],
        roles:['',Validators.required],
      });
    }
    onSubmit(): void {

      if (this.regForm.valid) {
        console.log('user created sucessfully',this.regForm.value);
        this.registerService.registerUser(this.regForm.value).subscribe((response) => {
          alert('User Created Sucessfully');
          //console.log("Response", response);
          this.regForm.reset();
    });
        
      } else{
        console.error('Login form validation errors:', this.regForm.errors);
        this.errorMessage= "Please fill all the fields";
      }

    
  }
  
}

