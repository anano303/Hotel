import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CityService } from '../../service/city.service';
import { BookingService } from '../../service/booking.service';
import { CommonModule } from '@angular/common';
import { Booking } from '../../modules/booking.model';
import { SelectedRoomsService } from '../../service/selected-rooms.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booked-rooms',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './booked-rooms.component.html',
  styleUrl: './booked-rooms.component.css',
})
export class BookedRoomsComponent implements OnInit {
  city: any[] = ['Tbilisi'];
  bookings: Booking[] = [];
  isMenuOpen = false;
  loading = true;
  error = '';
  userInfo: { name: string; phone: string } | null = null;
  showAllBookings = false;
  noUserInfo = false;
  userName = '';
  userPhone = '';

  // Add property to track currently cancelling booking
  cancellingBookingId: number | null = null;
  cancelSuccess = false;
  cancelError = '';

  constructor(
    private cityService: CityService,
    private bookingService: BookingService,
    private selectedRoomsService: SelectedRoomsService
  ) {}

  ngOnInit() {
    this.getCity();
    this.userInfo = this.bookingService.getUserInfo();
    this.noUserInfo =
      !this.userInfo || (!this.userInfo.name && !this.userInfo.phone);

    if (this.noUserInfo) {
      console.log('No user info found, showing all bookings by default');
      this.showAllBookings = true;
    }

    this.loadBookings();
  }

  getCity() {
    this.cityService.getCitys().subscribe((data) => {
      this.city = data;
    });
  }

  loadBookings() {
    this.loading = true;
    this.error = '';

    if (this.showAllBookings) {
      this.bookingService.getBookings().subscribe({
        next: (data) => {
          // Sort bookings by date, newest first
          this.bookings = this.sortBookingsByDate(data);
          console.log('Loaded all bookings:', this.bookings.length);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching all bookings:', err);
          this.error = 'Failed to load bookings. Please try again.';
          this.loading = false;
        },
      });
    } else {
      this.bookingService.getCurrentUserBookings().subscribe({
        next: (data) => {
          // Sort bookings by date, newest first
          this.bookings = this.sortBookingsByDate(data);
          console.log('Loaded user bookings:', this.bookings.length);
          this.loading = false;

          if (data.length === 0 && this.userInfo) {
            this.error = 'You have no bookings yet.';
          }
        },
        error: (err) => {
          console.error('Error fetching user bookings:', err);
          this.error = 'Failed to load your bookings. Please try again.';
          this.loading = false;
        },
      });
    }
  }

  // Helper function to sort bookings by date (newest first)
  sortBookingsByDate(bookings: Booking[]): Booking[] {
    return [...bookings].sort((a, b) => {
      // Convert string dates to Date objects for comparison
      const dateA = new Date(a.checkInDate);
      const dateB = new Date(b.checkInDate);
      // Sort in descending order (newest first)
      return dateB.getTime() - dateA.getTime();
    });
  }

  saveUserInfo() {
    // Create a new userInfo object using the input field values
    if (this.userName && this.userPhone) {
      const userInfo = {
        name: this.userName,
        phone: this.userPhone,
      };

      console.log('Saving user info:', userInfo);
      this.bookingService.saveUserInfo(userInfo);

      // Update the component's userInfo property
      this.userInfo = userInfo;
      this.noUserInfo = false;

      // Switch to filtered view
      this.showAllBookings = false;

      // Load bookings with new filter
      this.loadBookings();
    } else {
      // Show an error message if fields are missing
      this.cancelError = 'Please enter both name and phone number';
      setTimeout(() => (this.cancelError = ''), 3000);
    }
  }

  clearUserFilter() {
    this.bookingService.clearUserInfo();
    this.userInfo = null;
    this.noUserInfo = true;
    this.showAllBookings = true;
    this.loadBookings();
  }

  toggleViewMode() {
    this.showAllBookings = !this.showAllBookings;
    this.loadBookings();
  }

  // Check if the booking belongs to current user
  isUserBooking(booking: Booking): boolean {
    if (!this.userInfo || this.showAllBookings) {
      return false;
    }

    const nameMatch = !!(
      this.userInfo.name &&
      booking.customerName &&
      booking.customerName.toLowerCase() === this.userInfo.name.toLowerCase()
    );

    const phoneMatch = !!(
      this.userInfo.phone &&
      booking.customerPhone &&
      booking.customerPhone === this.userInfo.phone
    );

    return nameMatch || phoneMatch;
  }

  cancelBooking(bookingId: number, isUserBooking: boolean) {
    // Clear previous messages
    this.cancelSuccess = false;
    this.cancelError = '';

    if (!isUserBooking && !this.showAllBookings) {
      this.cancelError = 'You can only cancel your own bookings';
      setTimeout(() => (this.cancelError = ''), 3000);
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.cancellingBookingId = bookingId;

      this.selectedRoomsService.cancelBooking(bookingId).subscribe({
        next: (response) => {
          console.log('Cancellation successful:', response);
          this.bookings = this.bookings.filter(
            (booking) => booking.id !== bookingId
          );
          this.cancellingBookingId = null;
          this.cancelSuccess = true;
          setTimeout(() => (this.cancelSuccess = false), 3000);
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);

          if (
            err.message === 'You do not have permission to cancel this booking'
          ) {
            this.cancelError =
              'You do not have permission to cancel this booking';
          } else {
            this.cancelError = 'Failed to cancel booking. Please try again.';
          }

          this.cancellingBookingId = null;
          setTimeout(() => (this.cancelError = ''), 3000);
        },
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
