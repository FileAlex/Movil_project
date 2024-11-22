import { Component, inject, OnInit } from '@angular/core';
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

  idProducto: string = '';
  cantidad: number = 0;
  accion: 'entrada' | 'salida' = 'entrada';
  mensaje: string = '';

  constructor(private firebaseService: FirebaseService) {}

  async onRegistrarOperacion() {
    try {
      await this.firebaseService.manejarOperacion(this.idProducto, this.cantidad, this.accion);
      this.mensaje = 'Operación realizada con éxito.';
    } catch (error: any) {
      this.mensaje = error.message || 'Ocurrió un error.';
    }
  }

  ngOnInit() {
  }

}
