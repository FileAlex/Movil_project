import { inject, Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { User } from '../models/user.model';
import { getFirestore, setDoc, getDoc, doc } from '@angular/fire/firestore'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { UtilsService } from './utils.service';

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
  

}
