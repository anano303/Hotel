import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Rooms } from '../modules/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  private apiUrl = 'https://hotelbooking.stepprojects.ge/api/Rooms/GetAll';
  private baseUrl = 'https://hotelbooking.stepprojects.ge/api/Rooms';
  private roomsCache: Rooms[] | null = null;

<<<<<<< Updated upstream
  constructor(private http: HttpClient) { }
getRoomById(id: string): Observable<Rooms> {
  return this.http.get<Rooms>(`${this.apiUrl}/${id}`);
}
=======
  constructor(private http: HttpClient) {}
>>>>>>> Stashed changes

  getRoomById(id: number): Observable<Rooms> {
    console.log(`Fetching room with ID: ${id}`);

    // Try to get the room from the cache first
    if (this.roomsCache) {
      const cachedRoom = this.roomsCache.find((room) => room.id === id);
      if (cachedRoom) {
        console.log('Room found in cache:', cachedRoom);
        return of(cachedRoom);
      }
    }

    // If room is not in cache, try direct fetch first
    return this.http.get<Rooms>(`${this.baseUrl}/${id}`).pipe(
      tap((room) => console.log('Room data received directly:', room)),
      catchError((error) => {
        console.warn(
          `Direct fetch failed for room ID ${id}, trying from room list`,
          error
        );

        // If direct fetch fails, try to get it from the full list
        return this.getRooms().pipe(
          map((rooms) => {
            const room = rooms.find((r) => r.id === id);
            if (room) {
              console.log('Room found in list:', room);
              return room;
            }
            throw new Error(`Room with ID ${id} not found`);
          }),
          catchError((listError) => {
            console.error('Error fetching room from list:', listError);
            return throwError(
              () => new Error('Failed to fetch room details. Please try again.')
            );
          })
        );
      })
    );
  }





  getRooms(): Observable<Rooms[]> {
    return this.http.get<Rooms[]>(this.apiUrl).pipe(
      map((data: any[]) => {
        const rooms = data.map((room: any) => ({
          id: room.id,
          name: room.name,
          hotelId: room.hotelId,
          pricePerNight: room.pricePerNight,
          available: room.available,
          maximumGuests: room.maximumGuests,
          bookedDates: room.bookedDates || [],
          images: room.images || [],
        }));

        // Store in cache for future use
        this.roomsCache = rooms;
        return rooms;
      }),
      catchError((error) => {
        console.error('Error fetching rooms list:', error);
        return throwError(
          () => new Error('Failed to fetch rooms list. Please try again.')
        );
      })
    );
  }

  /**
   * Format a date to YYYY-MM-DD string
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    // Add 1 to month because getMonth() returns 0-11
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if a room is available for the given date range
   * @param room The room to check
   * @param checkInDate Check-in date (string in YYYY-MM-DD format)
   * @param checkOutDate Check-out date (string in YYYY-MM-DD format)
   * @returns boolean indicating if the room is available
   */
  isRoomAvailableForDates(
    room: Rooms,
    checkInDate: string,
    checkOutDate: string
  ): boolean {
    if (!room || !checkInDate || !checkOutDate) {
      return false;
    }

    if (!room.bookedDates || room.bookedDates.length === 0) {
      // If no booked dates, the room is available
      return true;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkIn >= checkOut
    ) {
      return false;
    }

    // Convert booked dates to simple string format for easy comparison
    const bookedDateStrings = room.bookedDates.map((bd) => {
      const date = new Date(bd.date);
      return this.formatDate(date);
    });

    // Check each day in the range
    const currentDate = new Date(checkIn);

    while (currentDate < checkOut) {
      const dateStr = this.formatDate(currentDate);

      if (bookedDateStrings.includes(dateStr)) {
        return false; // Found a conflict
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return true; // No conflicts found
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
