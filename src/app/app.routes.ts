import { Routes } from '@angular/router';
import { RoomsPageComponent } from './pages/rooms-page/rooms-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
  },
  {
    path: 'hotels',
    loadComponent: () =>
      import('./pages/hotels-page/hotels-page.component').then(
        (m) => m.HotelsPageComponent
      ),
  },
  {
    path: 'rooms/:hotelId',
    component: RoomsPageComponent,
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./pages/rooms-page/rooms-page.component').then(
        (m) => m.RoomsPageComponent
      ),
  },
  {
    path: 'booked-rooms',
    loadComponent: () =>
      import('./pages/booked-rooms/booked-rooms.component').then(
        (m) => m.BookedRoomsComponent
      ),
  },
  {
    path: 'booking/:id',
    loadComponent: () =>
      import('./booking-page/booking-page.component').then(
        (m) => m.BookingPageComponent
      ),
  },
];
