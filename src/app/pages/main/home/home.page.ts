import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc= inject(FirebaseService);
  utilsSvc= inject(UtilsService);

  micelaneos: any[] = [];

  constructor(private firebaseService: FirebaseService) {}

  //---------------Traer lista de articulos--------------
  ngOnInit() {
    this.firebaseService.getMicelaneosWithProveedor().subscribe((data) => {
      this.micelaneos = data;
    });
  }

  singOut(){
    this.firebaseSvc.singOut;
  }


}
