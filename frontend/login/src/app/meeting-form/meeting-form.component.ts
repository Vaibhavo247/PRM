import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../Services/register.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-meeting-form',
  templateUrl: './meeting-form.component.html',
  styleUrl: './meeting-form.component.scss'
})
export class MeetingFormComponent {
  
  product:string[]=[
    'AUTO',
    'CV',
    'TW',
    'FE',
  ];

  department:string[] = [
    'Sales',
    'Collection',
    'Cedit'
  ];
  states:string[] = [
      'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand ',
  'West Bengal',
  'Jammu and Kashmir',
  ];
  meetingsubject:string[] =[
    "Regional Credit Head to daily take a 15-20 min meeting with all SE on one Policy point. He should make the session and interesting one by giving examples. Also Q&A should be encouraged daily based on previous day's oversight report.",
    "Regional Collection can also have a quick 15 min call daily evening with the state collection team to share the day highlights, also he can post videos of CE Who have cracked very difficult cases.",
    "RSH to show a video to the SE of Top Performer of the day or week on how he has converted a case etc. Rsh must have a quick 15mins session everyday with state team to share the day's achievement.",
    "Regional Collection can also have a quick 15 min call daily evening with the state collection team to share the day highlights, also he can post videos of CE Who have cracked very difficult cases.",
    "RSH to call at least 2 CAT A / B DSA/Dealers and speak to Owner. This should be done daily by the Rsh."

  ];
  designation:string[]=[
    "RCH",
    "RM",
    "RSH",
    "DSA/Dealer"
  
  ]

  formSubmitted: any;
    
  constructor(private _fb:FormBuilder,private form:FormBuilder,private meeting:RegisterService,private _dialogRef:DialogRef){
   }
   meetingForm=this._fb.group({
    'Name':['',Validators.required],
    'emp_code':['',Validators.required],
    'designation':['',Validators.required],
    'state':['',Validators.required],
    'day':['',Validators.required],
    'Attendees':['',Validators.required],
    'performerName':['',Validators.required],
    'TeamSize':['',Validators.required],
     'department': ['', Validators.required],
     'Product_Name': ['',Validators.required],
     'meetingsubject':['',Validators.required],
     'Status':['',Validators.required],
 });

 getTodayString() {
  const today = new Date().toISOString().slice(0, 10);
  return today;
}

 onSubmit(){
  if (this.meetingForm.valid) {
    console.log('Data sent to backend:', this.meetingForm.value);
    const meetingData = this.meetingForm.value; // Retrieve form values
    if (meetingData.day) {
      meetingData.day = new Date(meetingData.day).toISOString().slice(0, 10);
    }    
    this.formSubmitted = true;
    // meetingData.day = meetingData.day.toISOString().slice(0, 10); // Format to YYYY-MM-DD
    console.log(meetingData.day);
    // Send data to server here
    this.meeting.saveMeetingData(this.meetingForm.value)
      .subscribe((response) => {
        console.log('Meeting data saved successfully:', response);
        this.meetingForm.reset();
        alert("Meeting details added Successfully");
        this._dialogRef.close();
        
        // Show success message to user (e.g., using a toast notification)
      }, (error) => {
        console.error('Error saving meeting data:', error);
        // Show user-friendly error message (e.g., display in a modal)
        
        
      });
  }

 }


}
