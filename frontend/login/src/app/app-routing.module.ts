import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MeetingFormComponent } from './meeting-form/meeting-form.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [{path: '', component:LoginPageComponent},
{ path:'register', component:RegisterComponent},
{path:'login', component:LoginPageComponent},
{path:'home',component:HomeComponent},
{ path:'forgot',component:ForgotPasswordComponent},
{path:'reset-password', component:ResetPasswordComponent},
{path:'meeting-form',component:MeetingFormComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
