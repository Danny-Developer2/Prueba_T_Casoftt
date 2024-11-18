import { Routes } from '@angular/router';
import { VehiclesComponent } from './vehicles/vehicle-catalog.component';
import { VehicleHomeComponent } from './vehicles/vehicle-home.component';
import { VehicleDetailComponent } from './vehicles/vehicle-detail.component';
import { VehicleAlertsComponent } from './vehicle-alerts/vehicle-alerts.component';
import { VehicleUpdateComponent } from './vehicles/vehicle-update.component';

export const routes: Routes = [
  { path: 'vehicles', component: VehiclesComponent },
  { path: 'home', component: VehicleHomeComponent },
  { path: 'vehicle/:id', component: VehicleDetailComponent },
  { path: 'vehicleAlert', component: VehicleAlertsComponent },
  { path: 'vehicle/:id/edit', component: VehicleUpdateComponent },
  // { path: '**', redirectTo: '/home' }
];
