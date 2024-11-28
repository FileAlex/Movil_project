import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
 
  firebaseSvc= inject(FirebaseService);
  utilsSvc= inject(UtilsService);

  reportes: any[] = []; // Aquí almacenaremos las acciones con su información de material
  mensaje: string = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes() {
    this.firebaseService.getAccionesConMaterial().subscribe({
      next: (acciones) => {
        this.reportes = acciones;
      },
      error: (error) => {
        this.mensaje = 'Error al cargar los reportes: ' + error.message;
      },
    });
  }
}
