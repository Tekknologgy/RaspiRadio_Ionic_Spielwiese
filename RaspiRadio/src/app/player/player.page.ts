import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController,MenuController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { resource } from 'selenium-webdriver/http';
import { Storage } from '@ionic/storage';

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
  private mywebsocket;
  private ip;
  private port;
  private RaspiRadio_URL;
  private randomstatus;
  private repeatstatus;
  private randomstyle;
  private repeatstyle;
  // = "ws://" + this.storage.get("IP") + ":" + this.storage.get("Port")

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    public menCtrl: MenuController,
    private wsService: WebsocketService,
    private storage: Storage
  ) {}


  /*
  //Die Funktion ist mit dem ebenfalls ausgeblendeten Button unterhalb der Tabs verbunden
  async storage_test() {
    this.storage.get('ip').then((val) => {
      console.log('Your ip is ', val);
      this.ip = val;
    });
    this.storage.get('port').then((val) => {
      console.log('Your port is ', val);
      this.port = val;
    });
    console.log("ws://" + this.ip + ":" + this.port);
  }
  */

  async trackSliderChanged() {
    this.secToTime(this.trackSliderValue).then((result) => this.currDuration = result);
    var data = JSON.stringify({"Action": "setElapsed","newElapsed": this.trackSliderValue});
    this.mywebsocket.next(data);
  }

  async volSliderChanged() {
    var data = JSON.stringify({"Action": "setVolume","newVolume": this.volSliderValue});
    this.mywebsocket.next(data);
  }

  //Wenn bei repeat oder random ein Paket zum Server verloren geht, kann es zu Problemen kommen
  //die sich selbst beheben, wenn repeat bzw. random nochmal ausgeführt wird und die Nachricht ankommt.
  async random() {
    if(this.randomstatus == 0) {
      this.randomstatus = 1;
      this.randomstyle = {'color': 'lightgreen'};
      var data = JSON.stringify({"Action": "Random","State": 1});
      this.mywebsocket.next(data);
    }
    else {
      this.randomstatus = 0;
      this.randomstyle = {'color': 'white'};
      var data = JSON.stringify({"Action": "Random","State": 0});
      this.mywebsocket.next(data);
    }
  }

  async repeat() {
    if(this.repeatstatus == 0) {
      this.repeatstatus = 1;
      this.repeatstyle = {'color': 'lightgreen'};
      var data = JSON.stringify({"Action": "Repeat","State": 1});
      this.mywebsocket.next(data);
    }
    else {
      this.repeatstatus = 0;
      this.repeatstyle = {'color': 'white'};
      var data = JSON.stringify({"Action": "Repeat","State": 0});
      this.mywebsocket.next(data);
    }
  }
  
  async backward() { 
    var data = JSON.stringify({"Action": "Previous"});
    this.mywebsocket.next(data);
  }

  async playpause() { 
    if(this.Playerstate == 'Play') {
      this.Playerstate = 'Pause';
      this.Playerstate_label = 'Pause';
      this.Playerstate_icon = 'pause';
      var data = JSON.stringify({"Action": "Pause","PauseStatus": 0});
      this.mywebsocket.next(data);
    }
    else if(this.Playerstate == 'Pause') {
      this.Playerstate = 'Play';
      this.Playerstate_label = 'Play';
      this.Playerstate_icon = 'play';
      var data = JSON.stringify({"Action": "Pause","PauseStatus": 1});
      this.mywebsocket.next(data);
    }
  }

  async test() {
    await console.log("test");
  }

  async stop() {
    this.Playerstate = "Stop";
    var data = JSON.stringify({"Action": "Stop"});
    this.mywebsocket.next(data);
  }

  async forward() { 
    var data = JSON.stringify({"Action": "Next"});
    this.mywebsocket.next(data);
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  /*
  async volChanged() {
    
  }
  */
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
    //Das Storage braucht ein await, weil er sich sonst schon verbindet bevor er die URL hat.
    //Das GET ist eine async Funktion und returned ein Promise, weswegen man den Wert erst aus den Promise lösen muss.
    //Deswegen ist das ngOnInit jetzt auch ein async.
    await this.storage.get('ip').then((val) => {
      //console.log('Your ip is ', val);
      this.ip = val;
    });
    await this.storage.get('port').then((val) => {
      //console.log('Your port is ', val);
      this.port = val;
    });
    this.RaspiRadio_URL = "ws://" + this.ip + ":" + this.port;  //Zusammensetzen der URL
    this.vol_Icon = 'volume-low';
    this.Playerstate = 'Play'; //zum testen für sebi
    this.Playerstate_label = 'Play';
    this.Playerstate_icon = 'play';

    this.mywebsocket = this.wsService.connect(this.RaspiRadio_URL);
    this.mywebsocket.subscribe(
      (next) => {
        let parsed = JSON.parse(next.data);
      
        if(parsed['Action'] == 'State') {
          this.Songname = parsed['Title']; //Setzt den Songnamen
          this.Interpret = parsed['Artist']; //Setzt den Interpreten
          this.trackSliderMax = parsed['Duration']; //setzt den Maximalwert des Sliders in Sekunden
          this.trackSliderValue = parsed['Elapsed'];  //setzt den Slider-Value damit der Slider an der aktuellen Abspielposition steht
          this.volSliderValue = parsed['Volume'];
          console.log(this.volSliderValue);
          //console.log(parsed['Elapsed']);
          this.secToTime(parsed['Duration']).then((result) => this.Songduration = result) //setzt die Anzeige der Titeldauer rechts neben dem Slider
          this.secToTime(parsed['Elapsed']).then((result) => this.currDuration = result);  //setzt den aktuellen Fortschritt des Titels links neben dem Slider
          if(parsed['State'] == 'Playing') {
            this.Playerstate = "Pause";
          }
          else if(parsed['State'] == 'Paused') {
            this.Playerstate = "Play";
          }

          //Randomstatus
          this.randomstatus = parsed['RandomState'];
          if(this.randomstatus == 0) {
            this.randomstyle = {'color': 'white'};
          }
          else {
            this.randomstyle = {'color': 'lightgreen'};
          }

          //Repeatstatus
          this.repeatstatus = parsed['RepeatState'];
          if(this.repeatstatus == 0) {
            this.repeatstyle = {'color': 'white'};
          }
          else {
            this.repeatstyle = {'color': 'lightgreen'};
          }

        }
      }
    )
  }
  async ngAfterViewInit() {
    await this.delay(500);
    var data = JSON.stringify({"Action": "getState"});
    this.mywebsocket.next(data);
    //console.log("Jetzt");
  }
}