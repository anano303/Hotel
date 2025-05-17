import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Booking } from '../modules/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'https://hotelbooking.stepprojects.ge/api/Booking';
  private userInfoKey = 'hotel_booking_user_info';

<<<<<<< Updated upstream
 private bookingApiUrl = 'https://hotelbooking.stepprojects.ge/api/Booking';

  constructor(private http: HttpClient) {}

  bookRoom(bookingData: any) {
    return this.http.post(this.bookingApiUrl, bookingData);
=======
  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  // Get only the current user's bookings
  getCurrentUserBookings(): Observable<Booking[]> {
    const userInfo = this.getUserInfo();

    if (!userInfo || (!userInfo.name && !userInfo.phone)) {
      console.log('No user info found in local storage');
      return of([]);
    }

    console.log('Filtering bookings for user:', userInfo);

    return this.http.get<Booking[]>(this.apiUrl).pipe(
      map((bookings) => {
        console.log('All bookings from API:', bookings);

        const filteredBookings = bookings.filter((booking) => {
          // Match based on name or phone number (case-insensitive)
          const nameMatch =
            userInfo.name &&
            booking.customerName &&
            booking.customerName.toLowerCase() === userInfo.name.toLowerCase();

          const phoneMatch =
            userInfo.phone &&
            booking.customerPhone &&
            booking.customerPhone === userInfo.phone;

          const isMatch = nameMatch || phoneMatch;

          if (isMatch) {
            console.log('Found matching booking:', booking);
          }

          return isMatch;
        });

        console.log('Filtered bookings:', filteredBookings);
        return filteredBookings;
      })
    );
  }

  createBooking(booking: Booking): Observable<any> {
    // Format dates to ISO string
    const formattedBooking = {
      ...booking,
      checkInDate: new Date(booking.checkInDate).toISOString(),
      checkOutDate: new Date(booking.checkOutDate).toISOString(),
    };

    // Save user info when creating a booking
    this.saveUserInfo({
      name: booking.customerName,
      phone: booking.customerPhone,
    });

    console.log(
      'Saving user info:',
      booking.customerName,
      booking.customerPhone
    );
    console.log('Sending booking request:', formattedBooking);

    return this.http.post<any>(this.apiUrl, formattedBooking);
  }

  deleteBooking(bookingId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${bookingId}`);
  }

  // Save user info to local storage
  saveUserInfo(userInfo: { name: string; phone: string }): void {
    if (!userInfo.name || !userInfo.phone) {
      console.warn('Attempted to save incomplete user info');
      return;
    }

    localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
    console.log('User info saved to local storage');
  }

  // Get user info from local storage
  getUserInfo(): { name: string; phone: string } | null {
    const userInfoStr = localStorage.getItem(this.userInfoKey);
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        return userInfo;
      } catch (e) {
        console.error('Error parsing user info from local storage', e);
        return null;
      }
    }
    return null;
  }

  // Clear user info from local storage
  clearUserInfo(): void {
    localStorage.removeItem(this.userInfoKey);
>>>>>>> Stashed changes
  }
}
