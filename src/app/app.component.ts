import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AppComponent implements OnInit, OnDestroy {
  localTime: string = '';
  selectedTime: string = '';
  selectedTimezone: string = '';
  timezones: string[] = [];

  private intervalId: any;
  private apiUrl = 'https://csharp-timeapi.onrender.com/api/time';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchTimezones();
    this.fetchLocalTime();

    this.intervalId = setInterval(() => {
      this.fetchLocalTime();
      if (this.selectedTimezone) {
        this.fetchSelectedTime(this.selectedTimezone);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchTimezones(): void {
    this.http.get<string[]>(`${this.apiUrl}/all-timezones`).subscribe({
      next: (zones) => {
        this.timezones = zones;
        if (zones.length > 0) {
          this.selectedTimezone = zones[0];
          this.fetchSelectedTime(this.selectedTimezone);
        }
      },
      error: (err) => console.error('Error fetching timezones:', err),
    });
  }

  fetchLocalTime(): void {
    this.http.get<any>(`${this.apiUrl}/local`).subscribe({
      next: (data) => {
        this.localTime = `${data.time} (${data.timezone})`;
      },
      error: (err) => console.error('Error fetching local time:', err),
    });
  }

  fetchSelectedTime(tz: string): void {
    const params = new HttpParams().set('tz', tz);
    this.http.get<any>(`${this.apiUrl}/timezone`, { params }).subscribe({
      next: (data) => {
        this.selectedTime = `${data.time} (${data.timezone})`;
      },
      error: (err) => {
        this.selectedTime = 'Invalid timezone selected';
      }
    });
  }


  onTimezoneChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTimezone = selectElement.value;
    this.fetchSelectedTime(this.selectedTimezone);
  }
}
