import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomsService } from '../service/rooms.service';
import { SelectedRoomsService } from '../service/selected-rooms.service';
import { BookingService } from '../service/booking.service';
import { Rooms } from '../modules/rooms.model';
import { FormsModule } from '@angular/forms';
>>>>>>> Stashed changes
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.css'],
<<<<<<< Updated upstream
  imports: [ReactiveFormsModule, CommonModule,RouterLink]
})
export class BookingPageComponent implements OnInit {
  room: any;
  bookingForm: FormGroup;
=======
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class BookingPageComponent implements OnInit {
  room?: Rooms;
  customerName: string = '';
  customerPhone: string = '';
  checkInDate: string = '';
  checkOutDate: string = '';
  loading: boolean = true;
  error: string = '';
  totalNights: number = 1;
  totalPrice: number = 0;
  isMenuOpen = false;
  roomId: number = 0;
  submitting: boolean = false;
  dateConflict: boolean = false;

  // Array of unavailable dates
  unavailableDates: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private roomsService: RoomsService,
<<<<<<< Updated upstream
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
    });
  }

 ngOnInit(): void {
  const roomId = this.route.snapshot.paramMap.get('id');
  if (roomId) {
    this.roomsService.getRoomById(roomId).subscribe(
      (room) => {
        this.room = room;
        console.log('Room details:', this.room);
      },
      (error) => console.error('Error fetching room details:', error)
=======
    private selectedRoomsService: SelectedRoomsService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set default check-in and check-out dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.checkInDate = this.formatDateForInput(today);
    this.checkOutDate = this.formatDateForInput(tomorrow);

    // Get room list first to ensure cache is populated
    this.roomsService.getRooms().subscribe({
      next: (rooms) => {
        // Once we have the rooms list, now try to get the specific room
        const idParam = this.route.snapshot.paramMap.get('id');
        console.log('Route param id:', idParam);

        if (!idParam) {
          this.error = 'Invalid room ID';
          this.loading = false;
          return;
        }

        this.roomId = +idParam;

        if (isNaN(this.roomId) || this.roomId <= 0) {
          this.error = 'Invalid room ID format';
          this.loading = false;
          return;
        }

        // Try to find room directly in the list we just loaded
        const roomFromList = rooms.find((r) => r.id === this.roomId);
        if (roomFromList) {
          this.room = roomFromList;
          this.totalPrice = this.room.pricePerNight;
          this.loading = false;
          this.calculateTotalPrice(); // Calculate initial price
          this.extractUnavailableDates(); // Identify unavailable dates
          this.checkDateAvailability(); // Check initial date selection availability
        } else {
          // If not found in list, try the single room endpoint
          this.fetchRoomDetails();
        }
      },
      error: (err) => {
        // If we can't get the list, fall back to direct fetch
        this.fetchRoomDetails();
      },
    });
  }

  /**
   * Extract all booked dates from the room and convert to string format
   */
  extractUnavailableDates(): void {
    if (!this.room || !this.room.bookedDates) return;

    this.unavailableDates = this.room.bookedDates.map((bookedDate) => {
      const date = new Date(bookedDate.date);
      return this.formatDateForInput(date);
    });

    console.log('Unavailable dates:', this.unavailableDates);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  fetchRoomDetails(): void {
    this.loading = true;
    this.error = '';

    this.roomsService.getRoomById(this.roomId).subscribe({
      next: (data) => {
        if (data) {
          this.room = data;
          this.totalPrice = this.room.pricePerNight;
          this.loading = false;
          this.calculateTotalPrice(); // Calculate initial price
          this.extractUnavailableDates(); // Identify unavailable dates
          this.checkDateAvailability(); // Check initial date selection availability
        } else {
          this.error = 'No room data found';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error in component when fetching room:', err);
        this.error = 'Error loading room details. Please try again.';
        this.loading = false;
      },
    });
  }

  isFormValid(): boolean {
    // Check for all required fields
    return !!(
      this.customerName &&
      this.customerPhone &&
      this.checkInDate &&
      this.checkOutDate &&
      !this.dateConflict &&
      !this.submitting &&
      !this.error
    );
  }

  /**
   * Check if the currently selected dates are available
   */
  checkDateAvailability(): void {
    if (!this.room || !this.checkInDate || !this.checkOutDate) {
      this.dateConflict = false;
      return;
    }

    // Reset error specifically for date conflicts
    if (
      this.error ===
      'The room is already booked for some of the selected dates.'
    ) {
      this.error = '';
    }

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);

    // Basic validation
    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkIn >= checkOut
    ) {
      this.dateConflict = true;
      this.error = 'Check-out date must be after check-in date';
      return;
    }

    // Check for conflicts with booked dates
    if (!this.room.bookedDates || this.room.bookedDates.length === 0) {
      // If no booked dates, the room is available
      this.dateConflict = false;
      return;
    }

    // Check each day in the range
    const currentDate = new Date(checkIn);
    this.dateConflict = false;

    while (currentDate < checkOut) {
      const dateStr = this.formatDateForInput(currentDate);

      // Check if this day is in the unavailable dates list
      if (this.unavailableDates.includes(dateStr)) {
        this.dateConflict = true;
        this.error =
          'The room is already booked for some of the selected dates.';
        break;
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // If no conflicts found, the date range is available
    if (!this.dateConflict) {
      console.log('Date range is available');
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  calculateTotalPrice(): void {
    if (!this.room || !this.checkInDate || !this.checkOutDate) return;

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);

    if (checkIn >= checkOut) {
      this.error = 'Check-out date must be after check-in date';
      return;
    }

    // Clear error if it's a date validation error
    if (this.error === 'Check-out date must be after check-in date') {
      this.error = '';
    }

    // Calculate nights difference
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    this.totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    this.totalPrice = this.room.pricePerNight * this.totalNights;

    // Check date availability when dates change
    this.checkDateAvailability();
  }

  retryLoading(): void {
    this.fetchRoomDetails();
  }

  submitBooking(): void {
    if (this.submitting) return; // Prevent multiple submissions

    if (!this.room) {
      this.error = 'Room details not available!';
      return;
    }

    if (
      !this.customerName ||
      !this.customerPhone ||
      !this.checkInDate ||
      !this.checkOutDate
    ) {
      this.error = 'Please fill in all required fields';
      return;
    }

    // Check date validation
    this.calculateTotalPrice();

    // Final check for date availability
    this.checkDateAvailability();

    if (this.dateConflict) {
      this.error = 'The room is already booked for some of the selected dates.';
      return;
    }

    if (this.error) {
      return; // Don't proceed if there are validation errors
    }

    this.submitting = true;
    this.error = '';

    const booking: Booking = {
      id: 0,
      roomID: this.room.id,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      totalPrice: this.totalPrice,
      isConfirmed: true,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
    };

    console.log('Booking object:', booking);

    // Use BookingService instead of SelectedRoomsService
    this.bookingService.createBooking(booking).subscribe({
      next: (response) => {
        console.log('Booking response:', response);
        alert('Booking successful!');
        this.submitting = false;
        this.router.navigate(['/booked-rooms']);
      },
      error: (errorResponse) => {
        console.error('Error during booking:', errorResponse);
        if (errorResponse.status === 200) {
          // If HTTP status is 200 but ended up in error handler
          alert('Booking successful!');
          this.submitting = false;
          this.router.navigate(['/booked-rooms']);
        } else if (
          errorResponse.error &&
          typeof errorResponse.error === 'string' &&
          errorResponse.error.includes('already booked')
        ) {
          this.error =
            'The room is already booked for some of the selected dates.';
        } else {
          this.error = 'Failed to book the room. Please try again.';
        }
        this.submitting = false;
      },
    });
  }

  onDateChange(): void {
    this.calculateTotalPrice();
  }
}
