import { Component, effect, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { BadRequest } from '../_models/badRequest';
import { SelectOption } from '../_models/selectOption';
import { BrandsService } from '../services/brands.service';
import { VehiclesService } from '../services/vehicles.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Vehicle } from '../_models/vehicle';
import { ToastService } from '../services/toast.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PaginatedResult } from '../_models/pagination';

type PhotoType = {
  url: FormControl<string | null>;
  id: FormControl<number | null>;
};

type FormType = {
  brand: FormControl<SelectOption | null>;
  model: FormControl<string | null>;
  year: FormControl<number | null>;
  color: FormControl<string | null>;
  photos: FormArray<FormGroup<PhotoType>>;
};

@Component({
  selector: 'app-vehicle-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-update.component.html',
})
export class VehicleUpdateComponent {
  router = inject(Router);
  error = signal<BadRequest | null>(null);
  toastService = inject(ToastService);
  sanitizer = inject(DomSanitizer);
  url: string | null = null;
  paginatedResult = signal<PaginatedResult<Vehicle[]> | null>(null);
  private brandsService = inject(BrandsService);
  service = inject(VehiclesService);
  showAlert: boolean = false;

  route = inject(ActivatedRoute);

  brandOptions: SelectOption[] = [];

  form: FormGroup<FormType> = new FormGroup<FormType>({
    brand: new FormControl<SelectOption | null>(null),
    model: new FormControl<string | null>(null),
    year: new FormControl<number | null>(null),
    color: new FormControl<string | null>(null),
    photos: new FormArray<FormGroup<PhotoType>>([]),
  });

  submitted = signal<boolean>(false);

  constructor() {


    this.service.getVehicles().subscribe((options) => {
      this.paginatedResult = options;
      console.log(this.paginatedResult, 'soy yo');
    
     
      
    });
    
    
    // Obtener opciones de marcas al inicializar el componente
    this.brandsService.getOptions().subscribe((options) => {
      this.brandOptions = options;
    });

    // Cargar datos del vehículo si el ID es válido
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.service.getById(parseInt(id)).subscribe({
        next: (data: Vehicle) => {
          console.log('Datos del vehículo', data); // Verificar los datos
          
          // Asignar los valores del vehículo a los campos del formulario
          this.form.patchValue({
            model: data.model,
            year: data.year,
            color: data.color,
          });

          // Verificar que la marca esté presente y asignarla
          const selectedBrand = this.brandOptions.find(
            (brand) => brand.id === data.brand?.id
          );
          if (selectedBrand) {
            this.form.controls.brand.setValue(selectedBrand);
          } else {
            console.log('Marca no encontrada:', data.brand);
          }

          // Rellenar las fotos en el formulario
          data.photos.forEach((photo) => {
            const photoFormGroup = new FormGroup<PhotoType>({
              url: new FormControl(photo.url),
              id: new FormControl(photo.id),
            });
            this.form.controls.photos.push(photoFormGroup);
          });
        },
        error: () => {
          this.toastService.add('Error al cargar los datos del vehículo.', 'danger');
        },
      });
    }
  }

  deletePhoto(index: number) {
    this.form.controls.photos.removeAt(index);
  }

  addPhoto() {
    if (this.form.controls.photos.length >= 5) {
      this.showAlert = true;
  
      
      setTimeout(() => {
        this.showAlert = false;
      }, 4000);
    } else {
      const photoFormGroup = new FormGroup({
        url: new FormControl<string | null>(null),
        id: new FormControl<number | null>(null),
      });
      this.form.controls.photos.push(photoFormGroup);
      this.form.updateValueAndValidity();
    }
  }
  onCancel() {
    
    this.router.navigate(['/home']);
  }
  

  onPhotoChange(url: string | null) {
    this.url = url;
  }

  ngOnInit() {
    this.service.getVehicles().subscribe({
      next: (data: PaginatedResult<Vehicle[]>) => {
        this.paginatedResult.set(data);  // Actualizar la señal con los datos obtenidos.
  
        if (data.items && data.items.length > 0) {
          const vehicle = data.items[0];  // Accedemos al primer vehículo (si hay más, ajusta este código).

          
          
          // Rellenamos el formulario con los valores del vehículo
          this.form.patchValue({
            brand: vehicle.brand,  // Marca seleccionada
            model: vehicle.model,  // Modelo
            year: vehicle.year,    // Año
            color: vehicle.color,  // Color
          });
  
          // Rellenar el array de fotos
          if (vehicle.photos && vehicle.photos.length > 0) {
            vehicle.photos.forEach((photo) => {
              this.form.controls.photos.push(
                new FormGroup<PhotoType>({
                  url: new FormControl(photo.url),  // URL de la foto
                  id: new FormControl(photo.id),    // ID de la foto
                })
              );
            });
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener los vehículos:', err);
      }
    });
  }
  

  onSubmit() {
    console.log('Formulario enviado');
    console.log(this.form.value);
  }

  optionChanged(event: HTMLSelectElement) {
    const value: SelectOption = JSON.parse(event.value);
    this.form.controls.brand.patchValue(value);
  }
}
