import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  pages = [
    {title: 'Inicio', url:'/main/home', icon:'home-outline'},
    {title: 'Acciones', url:'/main/actions', icon:'home-outline'},
    {title: 'Reportes', url:'/main/reports', icon:'home-outline'}
  ]

  router= inject(Router);
  
  firebaseSvc= inject(FirebaseService);
  utilSvc= inject(UtilsService);

  currentPath: string='';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if(event?.url) this.currentPath = event.url;
    })
  }

  signOut(){
    this.firebaseSvc.singOut();
  }

}
