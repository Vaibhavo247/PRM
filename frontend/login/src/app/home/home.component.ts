import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { RegisterService } from '../Services/register.service';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MeetingFormComponent } from '../meeting-form/meeting-form.component';
import * as XLSX from 'xlsx';

interface MeetingData {
  id: number;
  Name: string;
  day: Date;
  Attendees: number;
  performerName: string;
  Status: string;
  department: string;
  Product_Name: string;
  state: string;
  TeamSize: number;
  meetingsubject: string;
  emp_code: number;
  designation: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: { ngSkipHydration: 'true' },
})
export class HomeComponent implements OnInit {
  meetings: MeetingData[] = [];
  datasource!: MatTableDataSource<MeetingData>;
  apiUrl = 'http://localhost:3000/api/export-meetings'; 
  displayColumns: string[] = [
    'id',
    'Name',
    'state',
    'day',
    'Attendees',
    'performerName',
    'TeamSize',
    'department',
    'Product_Name',
    'meetingsubject',
    'Status',
    'emp_code',
    'designation'
  ];

  filterFormControl = new FormControl();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(private _dialog: MatDialog, private meetingService: RegisterService, private http: HttpClient) {}

  ngOnInit(): void {
    this.meetingService.getProducts().subscribe(data => {
      this.meetings = data;
      this.datasource = new MatTableDataSource<MeetingData>(this.meetings);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  getData() {
    this.http.get<MeetingData[]>(this.apiUrl)
      .subscribe(data => {
        this.meetings = data;
        this.datasource.data = this.meetings;
      });
  }

  openEditForm() {
    const dialog = this._dialog.open(MeetingFormComponent);

    dialog.afterClosed().subscribe((result: MeetingData | undefined) => {
      if (result) {
        this.handleFormData(result);
      }
    });
  }

  handleFormData(formData: MeetingData) {
    // Update your backend service or local data with the submitted meeting data
    this.getData(); // Refresh the table data after updating
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.datasource.data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Meeting Data');
  XLSX.writeFile(workbook, 'meeting_data.xlsx');
    this.http.get(this.apiUrl, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meeting_data.xlsx';
        link.click();
      });
  }
}
