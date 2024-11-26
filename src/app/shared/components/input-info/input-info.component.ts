import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-input-info',
    templateUrl: './input-info.component.html',
    styleUrls: ['./input-info.component.scss'],
    standalone: false
})
export class InputInfoComponent  implements OnInit {

  @Input() control!: FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete!: string;
  @Input() icon!: string;

  isPassword!: boolean;
  hide: boolean = true;


  constructor() { }

  ngOnInit() {
    if (this.type == 'password') this.isPassword =true;
  }

  showOrHidePassword(){
    this.hide = !this.hide

    if(this.hide) this.type='password';
    else this.type = 'text'
  }

}
