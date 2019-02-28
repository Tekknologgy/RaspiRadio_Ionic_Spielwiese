import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';

const RaspiRadio_URL = "ws://teilchen.ddns.net:8765";

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.page.html',
  styleUrls: ['./adduser.page.scss'],
})
export class AdduserPage implements OnInit {

  username:string;
  bg;
  public user=[
    {id:''},
    {username:''},
    {bgcolor:''},
    {playlistid:''}
  ]
  private mywebsocket;

  constructor(
    public navCtrl : NavController,
    private wsService: WebsocketService
  ) {}
  
  async getColor($event) { 
    this.bg = $event.target.id;
    //await console.log($event.target.id);
  }

  async saveuser(){
    this.user.push(
      {id:'1'},
      {username:this.username},
      {bgcolor:this.bg}
    )
    for(let e of this.user){
      console.log(e);
    }

    var data = JSON.stringify({"Action": "AddUser","Name": this.username,"Color": this.bg});
    this.mywebsocket.next(data);
  }

  ngOnInit() {
    this.mywebsocket = this.wsService.connect(RaspiRadio_URL);

  }
}
