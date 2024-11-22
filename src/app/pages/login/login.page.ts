import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  ngOnInit() {
  }

  async submit(){
    if(this.form.valid){

      const loading = await this.utilSvc.loading();
      await loading.present();

      this.firebaseSvc.singIn(this.form.value as User).then(res => {

        this.getUserInfo(res.user.uid);

      }).catch(error => {
        console.log(error);

        this.utilSvc.presentToast({
          message: error.message,
          duration: 2000,
          color:'danger',
          position:'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(async () => {
        if (loading) {
          await loading.dismiss();
        }
      })
    }
  }

  async getUserInfo(uid: string){
    if(this.form.valid){
      
      const loading = await this.utilSvc.loading();
      await loading.present();

      let path='users/${uid}';

      this.firebaseSvc.getDocument(path).then((user:User) => {
        this.utilSvc.saveInLocalStorage('user', user);
        this.utilSvc.routerLink('/main/home');
        this.form.reset();

        this.utilSvc.presentToast({
          message:'Te damos la bienvenida ', 
          duration: 2500,
          color:'primary',
          position:'middle',
          icon: 'alert-circle-outline'
        })
      }).catch(error => {
        console.log(error);

        this.utilSvc.presentToast({
          message: error.message,
          duration: 2000,
          color:'danger',
          position:'middle',
          icon: 'person-circle-outline'
        })

      }).finally(async () => {
        if (loading) {
          await loading.dismiss();
        }
      })
    }

  }

}
