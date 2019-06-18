import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController,MenuController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { resource } from 'selenium-webdriver/http';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home.page';
import { Router } from '@angular/router';
import { WSSubscriberService } from '../services/wssubscriber-service.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  loading; Songname; Playerstate; Interpret; Playerstate_label; Playerstate_icon; vol_Icon;
  Songduration; currsongtime; currDuration;

  private trackSliderMax;
  private trackSliderValue;
  private volSliderValue;
  private ip;
  private port;
  private RaspiRadio_URL;
  private randomstatus;
  private repeatstatus;
  private randomstyle;
  private repeatstyle;
  private volvalue = 0;
  private trackSliderManuallyChanged = false;
  private trackSliderManuallyChangedTime;
  private volumeSliderManuallyChanged = false;
  private volumeSliderManuallyChangedTime;
  private playManuallyChanged = false;
  private playManuallyChangedTime;
  private randomManuallyChanged = false;
  private randomManuallyChangedTime;
  private repeatManuallyChanged = false;
  private repeatManuallyChangedTime;
  
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    public menCtrl: MenuController,
    private wsService: WSSubscriberService,
    private storage: Storage,
    private router: Router
  ) {}

  ////////////////////////////
  // Eingehende Nachrichten //
  ////////////////////////////
  public OnMessage(next) {
    console.log(`Incoming: ${JSON.stringify(next)}`);
    ////////////////////////
    // Großes Status-Update
    if(next['Action'] == 'State') {
      this.Songname = next['Title']; // Setzt den Songnamen
      this.Interpret = next['Artist']; // Setzt den Interpreten
      this.trackSliderMax = next['Duration']; // Setzt den Maximalwert des Sliders in Sekunden
      var seconds = new Date().getTime() / 1000;
      if(this.trackSliderManuallyChanged == false || seconds > this.trackSliderManuallyChangedTime + 1) {
        this.trackSliderValue = next['Elapsed'];  // Setzt den Slider-Value damit der Slider an der aktuellen Abspielposition steht
      }
      if(this.volumeSliderManuallyChanged == false || seconds > this.volumeSliderManuallyChangedTime + 1) {
        this.volSliderValue = next['Volume']; // Setzt die Lautstärke
        if(this.volSliderValue < 33) {
          this.vol_Icon = "volume-mute";
        }
        else if(this.volSliderValue <= 66 && this.volSliderValue >= 33) {
          this.vol_Icon = "volume-low";
        }
        else {
          this.vol_Icon = "volume-high";
        }
      }
      this.secToTime(next['Duration']).then((result) => this.Songduration = result); // Setzt die Anzeige der Titeldauer rechts neben dem Slider
      this.secToTime(next['Elapsed']).then((result) => this.currDuration = result);  // Setzt den aktuellen Fortschritt des Titels links neben dem Slider
      
      // Play/Pause Button
      if(this.playManuallyChanged == false || seconds > this.playManuallyChangedTime + 1) {
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
      }
      
      // Randomstatus
      if(this.randomManuallyChanged == false || seconds > this.randomManuallyChangedTime + 1) {
        this.randomstatus = next['RandomState'];
        if(this.randomstatus == 0) {
          this.randomstyle = {'color': 'white'};
        }
        else {
          this.randomstyle = {'color': 'lightgreen'};
        }
      }
      
      // Repeatstatus
      if(this.repeatManuallyChanged == false || seconds > this.repeatManuallyChangedTime + 1) {
        this.repeatstatus = next['RepeatState'];
        if(this.repeatstatus == 0) {
          this.repeatstyle = {'color': 'white'};
        }
        else {
          this.repeatstyle = {'color': 'lightgreen'};
        }
      }
    }

    ///////////////////////////////////
    // Befehlsbestätigungen vom Server
    //
    // Antwort auf manuelles Setzen von Track, Volume, Play/Pause, Repeat und Random
    // weil Steuerelemente nicht flappen sollen. Bei Betätigen des entsprechenden Steuerelements
    // wird das entsprechende Flag auf True gesetzt, damit beim sekündlichen Update dieses
    // Element ausgespart wird, bis vom Server ein OK gekommen ist.
    // Sollte vom Server kein OK kommen, sorgt eine Timer-Variable dafür, dass ein Update nach
    // 1 Sekunde dennoch wieder zieht. Sollte bis dahin kein OK vom Server gekommen sein,
    // nehmen wir ein flappen des Steuerelementes in Kauf, damit keine falschen Daten angezeigt werden
    // und die Updates nicht auf ewig stehen bleiben.
    if(next['Action'] == 'setElapsed') {
      this.trackSliderManuallyChanged = false;
      this.trackSliderValue = next['Response'];
    }

    if(next['Action'] == 'setVolume') {
      this.volumeSliderManuallyChanged = false;
      this.volSliderValue = next['Response'];
      if(this.volSliderValue < 33) {
        this.vol_Icon = "volume-mute";
      }
      else if(this.volSliderValue <= 66 && this.volSliderValue >= 33) {
        this.vol_Icon = "volume-low";
      }
      else {
        this.vol_Icon = "volume-high";
      }
    }

    if(next['Action'] == 'Pause') {
      this.playManuallyChanged = false;
      if(next['Response'] == 'play') {
        this.Playerstate = 'Pause';
        this.Playerstate_label = 'Pause';
        this.Playerstate_icon = 'pause';
      }
      else if(next['Response'] == 'pause') {
        this.Playerstate = 'Play';
        this.Playerstate_label = 'Play';
        this.Playerstate_icon = 'play';
      }
    }

    if(next['Action'] == 'Random') {
      this.randomManuallyChanged = false;
      this.randomstatus = next['Response'];
      if(this.randomstatus == 0) {
        this.randomstyle = {'color': 'white'};
      }
      else {
        this.randomstyle = {'color': 'lightgreen'};
      }
    }

    if(next['Action'] == 'Repeat') {
      this.repeatManuallyChanged = false;
      this.repeatstatus = next['Response'];
      if(this.repeatstatus == 0) {
        this.repeatstyle = {'color': 'white'};
      }
      else {
        this.repeatstyle = {'color': 'lightgreen'};
      }
    }
  }

  ////////////////
  // GUI Events //
  ////////////////
  async trackSliderChanged() {
    this.trackSliderManuallyChangedTime = new Date().getTime() / 1000;
    this.trackSliderManuallyChanged = true;   //wird auf True gesetzt, damit ein sekündliches elapsed Update vom Server ignoriert wird
    await this.delay(50);   //es hat sich herausgestellt, dass ngModel hin und wieder länger braucht um den neuen Wert zu speichern
    var data = {"Action": "setElapsed","newElapsed": this.trackSliderValue};
    this.wsService.send(data);
  }

  async volSliderChanged(value) {
    this.volumeSliderManuallyChangedTime = new Date().getTime() / 1000;
    this.volumeSliderManuallyChanged = true;
    await this.delay(50);   //es hat sich herausgestellt, dass ngModel hin und wieder länger braucht um den neuen Wert zu speichern
    var data = {"Action": "setVolume","newVolume": this.volSliderValue};
    this.wsService.send(data);
  }

  async random() {
    this.randomManuallyChangedTime = new Date().getTime() / 1000;
    this.randomManuallyChanged = true;
    if(this.randomstatus == 0) {
      var data = {"Action": "Random","State": 1};
      this.wsService.send(data);
    }
    else {
      var data = {"Action": "Random","State": 0};
      this.wsService.send(data);
    }
  }

  async repeat() {
    this.repeatManuallyChangedTime = new Date().getTime() / 1000;
    this.repeatManuallyChanged = true;
    if(this.repeatstatus == 0) {
      var data = {"Action": "Repeat","State": 1};
      this.wsService.send(data);
    }
    else {
      var data = {"Action": "Repeat","State": 0};
      this.wsService.send(data);
    }
  }
  
  async backward() { 
    var data = {"Action": "Previous"};
    this.wsService.send(data);
  }

  async playpause() {
    this.playManuallyChangedTime = new Date().getTime() / 1000;
    this.playManuallyChanged = true;
    if(this.Playerstate == 'Play') {
      var data = {"Action": "Pause","PauseStatus": 0};
      this.wsService.send(data);
    }
    else if(this.Playerstate == 'Pause') {
      var data = {"Action": "Pause","PauseStatus": 1};
      this.wsService.send(data);
    }
  }

  async forward() { 
    var data = {"Action": "Next"};
    this.wsService.send(data);
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /////////////////////
  // Hilfsfunktionen //
  /////////////////////
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

  /////////////////
  // Page Events //
  /////////////////
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