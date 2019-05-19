import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController,MenuController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { resource } from 'selenium-webdriver/http';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home.page';
import { Router } from '@angular/router';
import { WSSubscriberService } from '../services/wssubscriber-service.service';

//const RaspiRadio_URL = "ws://teilchen.ddns.net:8765";
//const RaspiRadio_URL = "";

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  loading; Songname; Playerstate; Interpret; Playerstate_label; Playerstate_icon; vol_Icon; //playervariablen
  Songduration; currsongtime; currDuration;  //zeiten

  private trackSliderMax;
  private trackSliderValue;
  private volSliderValue;
  //private mywebsocket;
  private ip;
  private port;
  private RaspiRadio_URL;
  private randomstatus;
  private repeatstatus;
  private randomstyle;
  private repeatstyle;
  private volvalue = 0;
  private trackSliderManuallyChanged = false;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    public menCtrl: MenuController,
    private wsService: WSSubscriberService,
    private storage: Storage,
    private router: Router
  ) {}

  public OnMessage(next) {
    console.log(`Incoming: ${JSON.stringify(next)}`);
    if(next['Action'] == 'State') {
      this.Songname = next['Title']; //Setzt den Songnamen
      this.Interpret = next['Artist']; //Setzt den Interpreten
      this.trackSliderMax = next['Duration']; //setzt den Maximalwert des Sliders in Sekunden
      this.trackSliderValue = next['Elapsed'];  //setzt den Slider-Value damit der Slider an der aktuellen Abspielposition steht
      this.volSliderValue = next['Volume']; //Setzt die Lautstärke
      this.secToTime(next['Duration']).then((result) => this.Songduration = result); //setzt die Anzeige der Titeldauer rechts neben dem Slider
      this.secToTime(next['Elapsed']).then((result) => this.currDuration = result);  //setzt den aktuellen Fortschritt des Titels links neben dem Slider
      if(next['State'] == 'play') {
        this.Playerstate = 'Pause';
        this.Playerstate_label = 'Pause';
        this.Playerstate_icon = 'pause';
      }
      else if(next['State'] == 'pause') {
        this.Playerstate = 'Play';
        this.Playerstate_label = 'Play';
        this.Playerstate_icon = 'play';
      }
      //Randomstatus
      this.randomstatus = next['RandomState'];
      if(this.randomstatus == 0) {
        this.randomstyle = {'color': 'white'};
      }
      else {
        this.randomstyle = {'color': 'lightgreen'};
      }
      //Repeatstatus
      this.repeatstatus = next['RepeatState'];
      if(this.repeatstatus == 0) {
        this.repeatstyle = {'color': 'white'};
      }
      else {
        this.repeatstyle = {'color': 'lightgreen'};
      }
    }
    //Ist notwendig, damit der Trackslider bei einem sekündlichen Update vom Server
    //nicht unkontrolliert herumspringt... Beim auslösen von einem manuellen Setzen per Slider
    //wird trackSliderManuallyChanged auf true gesetzt. Erst wenn der Server mit OK antwortet
    //wird es wieder auf "True" gesetzt. In der Zwischenzeit wird ein sekündliches Update
    //vom Server ignoriert.
    if(next['Action'] == 'setElapsed') {
      if(next['Response'] == "OK") {
        this.trackSliderManuallyChanged = false;
      }
    }
    if(next['Action'] == 'newElapsed') {
      if(this.trackSliderManuallyChanged == false) {    //nur wenn der Trackslider NICHT manuell gesetzt wurde
        this.trackSliderValue = next['Value'];
        this.secToTime(next['Value']).then((result) => this.currDuration = result);
      }
    }
  }

  async trackSliderChanged() {
    this.trackSliderManuallyChanged = true;   //wird auf True gesetzt, damit ein sekündliches elapsed Update vom Server ignoriert wird
    await this.delay(50);   //es hat sich herausgestellt, dass ngModel hin und wieder länger braucht um den neuen Wert zu speichern
    this.secToTime(this.trackSliderValue).then((result) => this.currDuration = result);
    var data = {"Action": "setElapsed","newElapsed": this.trackSliderValue};
    this.wsService.send(data);
  }

  async volSliderChanged(value) {
    await this.delay(50);   //es hat sich herausgestellt, dass ngModel hin und wieder länger braucht um den neuen Wert zu speichern
    if(this.volSliderValue < 33) {
      this.vol_Icon = "volume-mute";
    }
    else if(this.volSliderValue <= 66 && this.volSliderValue >= 33) {
      this.vol_Icon = "volume-low";
    }
    else {
      this.vol_Icon = "volume-high";
    }
    var data = {"Action": "setVolume","newVolume": this.volSliderValue};
    this.wsService.send(data);
  }

  //Wenn bei repeat oder random ein Paket zum Server verloren geht, kann es zu Problemen kommen
  //die sich selbst beheben, wenn repeat bzw. random nochmal ausgeführt wird und die Nachricht ankommt.
  async random() {
    if(this.randomstatus == 0) {
      this.randomstatus = 1;
      this.randomstyle = {'color': 'lightgreen'};
      var data = {"Action": "Random","State": 1};
      this.wsService.send(data);
    }
    else {
      this.randomstatus = 0;
      this.randomstyle = {'color': 'white'};
      var data = {"Action": "Random","State": 0};
      this.wsService.send(data);
    }
  }

  async repeat() {
    if(this.repeatstatus == 0) {
      this.repeatstatus = 1;
      this.repeatstyle = {'color': 'lightgreen'};
      var data = {"Action": "Repeat","State": 1};
      this.wsService.send(data);
    }
    else {
      this.repeatstatus = 0;
      this.repeatstyle = {'color': 'white'};
      var data = {"Action": "Repeat","State": 0};
      this.wsService.send(data);
    }
  }
  
  async backward() { 
    var data = {"Action": "Previous"};
    this.wsService.send(data);
  }

  async playpause() { 
    if(this.Playerstate == 'Play') {
      this.Playerstate = 'Pause';
      this.Playerstate_label = 'Pause';
      this.Playerstate_icon = 'pause';
      var data = {"Action": "Pause","PauseStatus": 0};
      this.wsService.send(data);
    }
    else if(this.Playerstate == 'Pause') {
      this.Playerstate = 'Play';
      this.Playerstate_label = 'Play';
      this.Playerstate_icon = 'play';
      var data = {"Action": "Pause","PauseStatus": 1};
      this.wsService.send(data);
    }
  }

  async test() {
    await console.log("test");
  }

  async stop() {
    this.Playerstate = "Stop";
    var data = {"Action": "Stop"};
    this.wsService.send(data);
  }

  async forward() { 
    var data = {"Action": "Next"};
    this.wsService.send(data);
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async secToTime(onlyseconds): Promise<string> {

    let seconds = Math.floor(onlyseconds%60); //Berechnet den reinen Sekunden-Anteil
    let str_seconds = ""; //Speichert die Sekunden als String mit führenden Nullen für die Ausgabe am Ende
    let minutes = Math.floor(onlyseconds/60); //Berechnet den reinen Minuten-Anteil
    let str_minutes = ""; //Speichert die Minuten als String mit führenden Nullen für die Ausgabe am Ende
    let hours = Math.floor(onlyseconds/3600); //berechnet den reinen Stunden-Anteil
    let str_hours = ""; //Speichert die Stunden als String mit führenden Nullen für die Ausgabe am Ende
    let time = "";  //Speichert die zusammengesetzte Zeit als String für das Return
  
    if(seconds < 10) {
      str_seconds = '0'+seconds;

    }
    else if(seconds >= 10) {
      str_seconds = String(seconds);
    }

    if(hours >= 1) {
      hours = minutes - (60*hours);
    }

    if(minutes < 10) {
      str_minutes = '0'+minutes;
    }
    else if(minutes >= 10) {
      str_minutes = String(minutes);
    }

    if(hours < 10) {
      str_hours = '0'+hours;
    }
    else if(hours >= 10) {
      str_hours = String(hours);
    }

    time = str_hours+":"+str_minutes+":"+str_seconds;
    return time;
  }

  async ngOnInit() {
    console.log("Player Loading...")

    this.wsService.register(this);
    this.vol_Icon = 'volume-low';
    this.Playerstate = 'Play'; //zum testen für sebi
    this.Playerstate_label = 'Play';
    this.Playerstate_icon = 'play';
  }
  async ngAfterViewInit() {
    var data = {"Action": "getState"};
    this.wsService.send(data);
  }
}