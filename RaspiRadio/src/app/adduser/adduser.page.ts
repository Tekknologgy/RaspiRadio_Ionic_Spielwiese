import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.page.html',
  styleUrls: ['./adduser.page.scss'],
})
export class AdduserPage implements OnInit {
  username:string;
  constructor(public navCtrl : NavController) {}
  
 async getColor($event) { 
  await console.log($event.target.id);
}

  async saveuser(){
    await console.log(this.username);
    this.navCtrl.navigateForward('/login');
  }

  ngOnInit() {
  }
}
