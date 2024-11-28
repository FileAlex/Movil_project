import { Component, inject, OnInit } from '@angular/core';
import { Producto } from 'src/app/models/producto.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  firebaseSvc= inject(FirebaseService);
  utilsSvc= inject(UtilsService);
 
  productos: any[] = [];  // Array para almacenar los productos obtenidos
  idProducto: string = ''; // Variable para almacenar el id del producto seleccionado
  cantidad: number = 0;
  accion: 'entrada' | 'salida' = 'entrada';
  mensaje: string = '';

  constructor(private firebaseService: FirebaseService) {}

  // Llamada a la función para obtener los productos al inicializar el componente
  ngOnInit(): void {
    this.obtenerProductos();
  }

  // Función para obtener los productos desde Firebase
  obtenerProductos() {
    this.firebaseService.getProductos().subscribe({
      next: (productos) => {
        console.log('Productos:', productos);  // Verifica si los productos se están recibiendo correctamente
        this.productos = productos;
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
      },
    });
  }

  // Función para registrar la operación (entrada/salida de producto)
  async onRegistrarOperacion() {
    try {
      // Lógica de registro de la operación
      this.mensaje = 'Operación realizada con éxito.';
    } catch (error: any) {
      this.mensaje = error.message || 'Ocurrió un error.';
    }
  }

}
