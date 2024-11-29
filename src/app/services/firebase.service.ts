import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, switchMap, from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { User } from '../models/user.model';
import { getFirestore, setDoc, getDoc, doc, Firestore, collection, collectionData, docData, updateDoc, serverTimestamp } from '@angular/fire/firestore'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { UtilsService } from './utils.service';
import { addDoc, getDocs, query, where } from 'firebase/firestore';
import { Producto } from '../models/producto.model';


interface Proveedor {
  Nombre: string;
}

@Injectable({
  providedIn: 'root'
})



export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilSvc = inject(UtilsService);
  //===================================Autenticación de Usuarios ==========================

  getAuth() {
    return getAuth();
  }
  //-----------Acceder-------
  singIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  //-----------Nuevo usuario-------
  singUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  //-----------Actualizar usuario-------
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  //------------Cerrar Sesión----------
  singOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilSvc.routerLink('/login')
  }

  //=================Base de datos=================================

  //-----------Setear un documento ---------
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  //------------Get de un documento-------------
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }



  //===========================Stock pantalla inicio==================

  getMicelaneosWithProveedor(): Observable<any[]> {
    const firestore = getFirestore();

    const micelaneosRef = collection(firestore, 'Micelaneos');
    const proveedoresRef = collection(firestore, 'Proveedor');

    return collectionData(micelaneosRef).pipe(
      switchMap((micelaneos: any[]) => {
        // Verificar estructura

        return collectionData(proveedoresRef).pipe(
          map((proveedores: any[]) => {
            // Verificar estructura

            // Construcción del resultado
            const resultado = micelaneos.map((micelaneo) => {
              const proveedor = proveedores.find(
                (p) => String(p.ID_P) === String(micelaneo.Proveedor) // Asegurar comparación por valor
              );

              return {
                nombre: micelaneo.Nombre,
                stock: micelaneo.Stock,
                proveedorNombre: proveedor?.Nombre || 'Proveedor no encontrado',
              };
            });

            // Validar resultado
            return resultado;
          })
        );
      })
    );
  }

  //===================================== Crear Reportes =============================//
  // Método para obtener la lista de productos
  getProductos(): Observable<any[]> {
    return this.firestore.collection('Micelaneos').snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id; // ID del documento de Firebase
          return { idFirebase: id, ID_M: data.ID_M, Nombre: data.Nombre }; // Incluye ID_M y otros datos
        })
      )
    );
  }

  // Método para registrar una operación de entrada o salida
  async registrarOperacion(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
    const productoRef = this.firestore.collection('productos').doc(idProducto);
    const productoDoc = await productoRef.get().toPromise();

    if (!productoDoc.exists) {
      throw new Error('Producto no encontrado');
    }

    const producto = productoDoc.data();

    // Lógica para registrar la operación (puedes agregar más detalles según lo necesites)
    const operacionRef = this.firestore.collection('operaciones').add({
      productoId: idProducto,
      cantidad: cantidad,
      accion: accion,
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
    });
  }
  /**
   * Actualiza el stock de un producto en la colección Micelaneos.
   * @param idProducto ID del producto.
   * @param cantidad Cantidad a añadir o restar del stock.
   * @param accion 'entrada' o 'salida'.
   */
  async actualizarStock(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
    const firestore = getFirestore();
    const productosRef = collection(firestore, 'Micelaneos');
  
    // Busca el producto por ID_M
    const q = query(productosRef, where('ID_M', '==', idProducto));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error('Producto no encontrado.');
    }
  
    const productoDoc = querySnapshot.docs[0]; // Obtén el primer documento que coincide
    const productoData = productoDoc.data();
    const stockActual = productoData['Stock'] || 0;
  
    // Calcula el nuevo stock
    const nuevoStock = accion === 'entrada' ? stockActual + cantidad : stockActual - cantidad;
  
    if (nuevoStock < 0) {
      throw new Error('No hay suficiente stock para realizar esta salida.');
    }
  
    // Actualiza el stock
    await updateDoc(productoDoc.ref, { Stock: nuevoStock });
  }

  /**
   * Registra una acción en la colección de acciones.
   * @param idProducto ID del producto relacionado con la acción.
   * @param cantidad Cantidad de la acción.
   * @param accion Tipo de acción (entrada o salida).
   */
  async registrarAccion(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
    const firestore = getFirestore();
    const accionesRef = collection(firestore, 'Acciones');

    // Obtener la fecha y hora actuales como strings
    const fecha = new Date();
    const fechaString = fecha.toLocaleDateString(); // Fecha en formato: dd/mm/yyyy
    const horaString = fecha.toLocaleTimeString();  // Hora en formato: hh:mm:ss

    // Registrar la acción
    await addDoc(accionesRef, {
      Material: idProducto,  // Referencia al ID del producto
      Cantidad: cantidad,    // Cantidad de la acción
      Accion: accion,        // Tipo de acción (entrada o salida)
      Fecha: fechaString,    // Fecha como string
      Hora: horaString       // Hora como string
    });
  }

  /**
   * Maneja una operación de entrada o salida de producto.
   * @param idProducto ID del producto.
   * @param cantidad Cantidad a actualizar.
   * @param accion Tipo de acción ('entrada' o 'salida').
   */
  async manejarOperacion(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
    // Primero actualiza el stock
    await this.actualizarStock(idProducto, cantidad, accion);
    // Luego registra la acción
    await this.registrarAccion(idProducto, cantidad, accion);
  }
  

  //=====================================Mostrar Reportes==============================//
  getAccionesConMaterial(): Observable<any[]> {
  const firestore = getFirestore();

  // Referencia a las colecciones Acciones y Micelaneos
  const accionesRef = collection(firestore, 'Acciones');
  const micelaneosRef = collection(firestore, 'Micelaneos');

  // Obtener las acciones
  return collectionData(accionesRef).pipe(
    switchMap((acciones: any[]) => {
      return collectionData(micelaneosRef).pipe(
        map((micelaneos: any[]) => {
          return acciones.map((accion) => {
            // Buscar el material asociado por el campo ID_M
            const material = micelaneos.find(
              (m) => String(m.ID_M) === String(accion.Material)
            );

            return {
              ...accion,
              materialNombre: material?.Nombre || 'Material no encontrado',
            };
          });
        })
      );
    })
  );
}

}