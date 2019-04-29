import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { GlobalVarService } from '.././services/global-var.service';

const RaspiRadio_URL = "ws://teilchen.ddns.net:8765";

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.page.html',
  styleUrls: ['./adduser.page.scss'],
})
export class AdduserPage implements OnInit {

  i;
  maxUser:number = 0;
  username:string;
  bg;
  private mywebsocket;

  constructor(
    public navCtrl : NavController
    ,private wsService: WebsocketService
    ,public globalVarService: GlobalVarService
  ) {}
  
  async getColor($event) { 
    this.bg = $event.target.id;
  }

  async saveuser(){
    console.log(this.maxUser);
    this.maxUser = this.globalVarService.user.length +1;
    console.log(this.maxUser);
/*    this.globalVarService.user.push(
      {id:this.maxUser},
      {username:this.username},
      {bgcolor:this.bg}
    ) */

    var data = JSON.stringify({"Action": "AddUser","Name": this.username,"Color": this.bg});
    //this.mywebsocket.next(data);
  }

  ngOnInit() {
    this.mywebsocket = this.wsService.connect(RaspiRadio_URL);
  }
}
