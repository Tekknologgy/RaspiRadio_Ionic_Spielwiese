import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.page.html',
  styleUrls: ['./adduser.page.scss'],
})
export class AdduserPage implements OnInit {
  username:string;
  bg;
  user=[
    {id:''},
    {username:''},
    {bgcolor:''},
    {playlistid:''}
  ]
  constructor(public navCtrl : NavController) {}
  
 async getColor($event) { 
  this.bg = $event.target.id;
  await console.log(this.bg);
  await console.log($event.target.id);
  
}

  async saveuser(){
    //await console.log(this.username);
    //await console.log(this.bg);
    //this.navCtrl.navigateForward('/login');
    this.user.push(
      {id:'1'},
      {username:this.username},
      {bgcolor:this.bg}
    )
    for(let e of this.user){
      console.log(e);
    }
  }

  ngOnInit() {
  }
}
