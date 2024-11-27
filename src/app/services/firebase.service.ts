import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, switchMap, from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { User } from '../models/user.model';
import { getFirestore, setDoc, getDoc, doc, Firestore, collection, collectionData, docData, updateDoc, serverTimestamp} from '@angular/fire/firestore'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { UtilsService } from './utils.service';
import { addDoc } from 'firebase/firestore';


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

   getAuth(){
    return getAuth();
   }
  //-----------Acceder-------
  singIn(user: User){
    return signInWithEmailAndPassword(getAuth(),user.email, user.password)
  }

  //-----------Nuevo usuario-------
  singUp(user: User){
    return createUserWithEmailAndPassword(getAuth(),user.email, user.password)
  }

  //-----------Actualizar usuario-------
  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser, {displayName})
  }

  //------------Cerrar Sesión----------
  singOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilSvc.routerLink('/login')
  }

//=================Base de datos=================================

  //-----------Setear un documento ---------
  setDocument(path: string, data:any){
    return setDoc(doc(getFirestore(), path), data);
  }

  //------------Get de un documento-------------
  async getDocument(path:string){
    return (await getDoc(doc(getFirestore(), path))).data();
  }
  


//===========================Stock pantalla inicio==================

getMicelaneosWithProveedor(): Observable<any[]> {
  const firestore = getFirestore();

  // Referencia a la colección de micelaneos
  const micelaneosRef = collection(firestore, 'Micelaneos');

  // Obtén la lista de micelaneos
  return collectionData(micelaneosRef, { idField: 'ID_M' }).pipe(
    switchMap((micelaneos: any[]) => {
      
      // Para cada micelaneo, obtenemos su proveedor
      const micelaneoObservables = micelaneos.map((micelaneo) => {
        const proveedorRef = doc(firestore, `Proveedor/${micelaneo.proveedor}`);
        return docData(proveedorRef) as Observable<Proveedor | undefined>;
      });

      // Combinamos todos los observables en uno solo
      return combineLatest(
        micelaneos.map((micelaneo, index) =>
          micelaneoObservables[index].pipe(
            map((proveedor) => ({
              nombre: micelaneo.Nombre,
              stock: micelaneo.Stock,
              proveedorNombre: proveedor?.Nombre || 'Proveedor no encontrado',
            }))
          )
        )
      );
    })
  );
}

//===================================== Crear Reportes =============================//
async actualizarStock(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
  const firestore = getFirestore();
  const productoRef = doc(firestore, `Micelaneos/${idProducto}`);

  // Obtener datos del producto
  const productoSnap = await getDoc(productoRef);
  if (!productoSnap.exists()) {
    throw new Error('Producto no encontrado.');
  }

  const productoData = productoSnap.data();
  const stockActual = productoData?.['Stock'] || 0;

  // Validar y calcular el nuevo stock
  const nuevoStock = accion === 'entrada'
    ? stockActual + cantidad
    : stockActual - cantidad;

  if (nuevoStock < 0) {
    throw new Error('No hay suficiente stock para realizar esta salida.');
  }

  // Actualizar el stock
  await updateDoc(productoRef, { Stock: nuevoStock });
}

/**
 * Registra una acción en la colección Acciones.
 * @param idProducto ID del producto asociado a la acción.
 * @param cantidad Cantidad de la acción.
 * @param accion Tipo de acción ("entrada" o "salida").
 * @returns Una promesa que se resuelve cuando la acción se registra.
 */
async registrarAccion(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
  const firestore = getFirestore();
  const accionesRef = collection(firestore, 'Acciones');

  // Registrar acción
  await addDoc(accionesRef, {
    Material: idProducto, // Referencia al producto
    Cantidad: cantidad,
    Accion: accion,
    Fecha: serverTimestamp(), // Se autogenera la fecha
    Hora: serverTimestamp()   // Se autogenera la hora
  });
}

/**
 * Maneja una operación de entrada o salida.
 * @param idProducto ID del producto.
 * @param cantidad Cantidad involucrada.
 * @param accion "entrada" o "salida".
 */
async manejarOperacion(idProducto: string, cantidad: number, accion: 'entrada' | 'salida'): Promise<void> {
  await this.actualizarStock(idProducto, cantidad, accion);
  await this.registrarAccion(idProducto, cantidad, accion);
}

//=====================================Mostrar Reportes==============================//
getAccionesConMaterial(): Observable<any[]> {
  const firestore = getFirestore();

  // Referencia a la colección Acciones
  const accionesRef = collection(firestore, 'Acciones');

  // Obtén las acciones
  return collectionData(accionesRef, { idField: 'ID_A' }).pipe(
    switchMap((acciones: any[]) => {
      const accionesObservables = acciones.map((accion) => {
        // Referencia al material asociado
        const materialRef = doc(firestore, `Micelaneos/${accion.Material}`);
        return docData(materialRef).pipe(
          map((material) => ({
            ...accion,
            materialNombre: material?.['Nombre'] || 'Material no encontrado',
          }))
        );
      });

      // Combinar todas las acciones con sus materiales
      return combineLatest(accionesObservables);
    })
  );
}
}
