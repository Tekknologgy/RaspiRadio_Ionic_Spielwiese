import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController,MenuController} from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { resource } from 'selenium-webdriver/http';

const RaspiRadio_URL = "ws://teilchen.ddns.net:8765";

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  private mywebsocket;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    public menCtrl: MenuController,
    private wsService: WebsocketService
  ){}

  loading; Songname; Playerstate; Interpret; //playervariablen
  Songduration; currsongtime; currDuration;  //zeiten
  //seconds; minutes; hours; songtime;    DEAKTIVIERT WEIL JETZT IN FUNKTION MIT ÜBERGABE & RÜCKGABEWERT

  private sliderMax;
  private sliderValue;

  async SliderChanged() {
    //console.log("Slider Changed: "+this.sliderValue)
    this.secToTime(this.sliderValue).then((result) => this.currDuration = result);
    var data = JSON.stringify({"Action": "setElapsed","newElapsed": this.sliderValue});
    this.mywebsocket.next(data);
}

  async backward() {  //function von backward (backend muss noch eingebaut werden)
    //this.backward_test();
    //await this.delay(2000);
    //this.loading.dismiss();
    var data = JSON.stringify({"Action": "Previous"});
    this.mywebsocket.next(data);
  }
  /*
  async backward_test() {
    this.loading = await this.loadingCtrl.create({
      message:'backwards',
    });
    return await this.loading.present();
  }
  */

  async playpause(){  //toggle function von play und pause mit ändern des symbols und des labels (backend muss noch eingebaut werden)
    if(this.Playerstate == 'Play') {
      this.Playerstate = 'Pause';
      var data = JSON.stringify({"Action": "Pause","PauseStatus": 0});
      this.mywebsocket.next(data);
      //await console.log(this.Playerstate);
    }
    else if(this.Playerstate == 'Pause') {
      this.Playerstate = 'Play';
      var data = JSON.stringify({"Action": "Pause","PauseStatus": 1});
      this.mywebsocket.next(data);
      //await console.log(this.Playerstate);
    }
    else if(this.Playerstate == 'Stop') {
      this.Playerstate = 'Play';
      var data = JSON.stringify({"Action": "Play"});
      this.mywebsocket.next(data);
      //await console.log(this.Playerstate);
    }
  }
  /*
  async playpause_test() {
    this.loading = await this.loadingCtrl.create({
      message:'play',
    });
    return await this.loading.present();
  }
  */
  async stop() { //function von stop (backend muss noch eingebaut werden)
    //this.stop_test();
    //await this.delay(2000);
    //this.loading.dismiss();
    this.Playerstate = "Stop";
    var data = JSON.stringify({"Action": "Stop"});
    this.mywebsocket.next(data);
  }
  /*
  async stop_test() {
    this.loading = await this.loadingCtrl.create({
      message:'stop',
    });
    return await this.loading.present();
  }
  */
  async forward(){ //function von forward (backend muss noch eingebaut werden)
    //this.forward_test();
    //await this.delay(2000);
    //this.loading.dismiss();
    var data = JSON.stringify({"Action": "Next"});
    this.mywebsocket.next(data);
  }
  /*
  async forward_test() {
    this.loading = await this.loadingCtrl.create({
      message:'foward',
    });
    return await this.loading.present();
  }
  */
  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /*
  async songdur(){ //hier wird er nochmal kontrolliert bzgl führender 0en etc und ausgegeben
    if(this.seconds < 10){
      this.seconds = '0'+this.seconds;
    }
    if(this.hours >= 1){
      this.minutes = this.minutes - (60*this.hours);
    }
    if(this.minutes < 10){
      this.minutes = '0'+this.minutes;
    }
    if(this.hours < 10){
      this.hours = '0'+this.hours;
    }
   this.Songduration = this.hours+":"+this.minutes+":"+this.seconds;
  }

  async songval(){  //dauer des liedes wird hier eingelesen und berechnet 
    this.songtime = 4360;
    this.seconds = this.songtime%60;
    this.minutes = Math.floor(this.songtime/60);
    this.hours = Math.floor(this.songtime/3600);
    await this.songdur();
  }

  async test(){ //test function für das ändern des sliders und des aktuellen laufzeit labels
    this.currsongtime = 3070;
    this.seconds = this.currsongtime%60;
    this.minutes = Math.floor(this.currsongtime/60);
    this.hours = Math.floor(this.currsongtime/3600);
  
    if(this.seconds < 10){
      this.seconds = '0'+this.seconds;
      //console.log(this.minutes+"sekunden kontrolle");
    }
    if(this.hours >= 1){
      this.minutes = this.minutes - (60*this.hours);
      //console.log(this.minutes+"stunden kontrolle")
    }
    if(this.minutes < 10){
      this.minutes = '0'+this.minutes;
     // console.log(this.minutes+"minuten kontrolle");
    }
    if(this.hours < 10){
      this.hours = '0'+this.hours;
    }
   this.currDuration = this.hours+":"+this.minutes+":"+this.seconds;
    await console.log(this.currDuration);
  }
  */

  //***************************************************************
  //endgültige Funktion zum Berechnen der hh:mm:ss aus den Sekunden
  //***************************************************************
  async secToTime(onlyseconds): Promise<string> {

    let seconds = onlyseconds%60; //Berechnet den reinen Sekunden-Anteil
    let str_seconds = ""; //Speichert die Sekunden als String mit führenden Nullen für die Ausgabe am Ende
    let minutes = Math.floor(onlyseconds/60); //Berechnet den reinen Minuten-Anteil
    let str_minutes = ""; //Speichert die Minuten als String mit führenden Nullen für die Ausgabe am Ende
    let hours = Math.floor(onlyseconds/3600); //berechnet den reinen Stunden-Anteil
    let str_hours = ""; //Speichert die Stunden als String mit führenden Nullen für die Ausgabe am Ende
    let time = "";  //Speichert die zusammengesetzte Zeit als String für das Return
  
    //Führende Nullen bei den Sekunden
    if(seconds < 10) {
      str_seconds = '0'+seconds;
      //console.log(minutes+"sekunden kontrolle");
    }
    else if(seconds > 10) {
      str_seconds = String(seconds);
    }

    //Berechnet die Anzahl der Stunden
    if(hours >= 1){
      hours = minutes - (60*hours);
      //console.log(this.minutes+"stunden kontrolle")
    }

    //Führende Nullen bei den Minuten
    if(minutes < 10){
      str_minutes = '0'+minutes;
      //console.log(this.minutes+"minuten kontrolle");
    }
    else if(minutes > 10) {
      str_minutes = String(minutes);
    }

    //Führende Nullen bei den Stunden
    if(hours < 10){
      str_hours = '0'+hours;
    }
    else if(hours > 10) {
      str_hours = String(hours);
    }

    //Zusammensetzen des Strings für die Zeit
    time = str_hours+":"+str_minutes+":"+str_seconds;

    return time;
    //await console.log(this.currDuration);
  }

  ngOnInit() {//{{currTitel}}
    //this.Songname = "test";
    //this.Interpret ="testband";
    //this.songval();
    //this.test();
    //this.Playerstate = 'Play';

    //Connect to Websocket and Subscribe to Messages
    this.mywebsocket = this.wsService.connect(RaspiRadio_URL);
    this.mywebsocket.subscribe(
      (next) => {
        //Parsen der JSON-Nachricht        
        let parsed = JSON.parse(next.data);

        //Wenn der Player-Status gesendet wurde werden die Elemente der Player Page aktualisiert
        if(parsed['Action'] == 'State') {
          this.Songname = parsed['Title']; //Setzt den Songnamen
          this.Interpret = parsed['Artist']; //Setzt den Interpreten
          this.sliderMax = parsed['Duration']; //setzt den Maximalwert des Sliders in Sekunden
          this.sliderValue = parsed['Elapsed'];  //setzt den Slider-Value damit der Slider an der aktuellen Abspielposition steht
          this.secToTime(parsed['Duration']).then((result) => this.Songduration = result) //setzt die Anzeige der Titeldauer rechts neben dem Slider
          this.secToTime(parsed['Elapsed']).then((result) => this.currDuration = result);  //setzt den aktuellen Fortschritt des Titels links neben dem Slider
          //Volume fehlt noch
          if(parsed['State'] == 'Playing') {
            this.Playerstate = "Pause"; //etwas verwirrend, weil mit Playerstate "Pause" gemeint ist, dass das Pause-Symbol angezeigt werden soll und der Player gerade spielt
          }
          else if(parsed['State'] == 'Paused') {
            this.Playerstate = "Play"; //etwas verwirrend, weil mit Playerstate "Play" gemeint ist, dass das Play-Symbol angezeigt werden soll und der Player gerade pausiert
          }
          else if(parsed['State'] == 'Stopped') {
            this.Playerstate = "Stop"; //etwas verwirrend, weil mit Playerstate "Stop" gemeint ist, dass das Play-Symbol angezeigt werden soll und der Player gerade gestoppt ist
          }
        }
      }
    )

    /*
    //Simuliert den Empfang von Daten über Websocket und setzt aktuelle Playerdaten
    //wird entfernt, wenn Daten vom Websocket kommen
    let testdata = JSON.stringify({"Action": "State","Title": "Nothing else matters","Artist": "Metallica","Duration": 180,"Elapsed": 120,"Volume": 80,"State": "Paused"});
    let testdisplay = JSON.parse(testdata);
    if(testdisplay['Action'] == 'State') {
      this.Songname = testdisplay['Title'];
      this.Interpret = testdisplay['Artist'];
      this.sliderMax = testdisplay['Duration']; //setzt den Maximalwert des Sliders in Sekunden
      this.sliderValue = testdisplay['Elapsed'];  //setzt den Slider-Value damit der Slider an der aktuellen Abspielposition steht
      this.secToTime(testdisplay['Duration']).then((result) => this.Songduration = result) //setzt die Anzeige der Titeldauer rechts neben dem Slider
      this.secToTime(testdisplay['Elapsed']).then((result) => this.currDuration = result);  //setzt den aktuellen Fortschritt des Titels links neben dem Slider
      //Volume fehlt noch
      if(testdisplay['State'] == 'Playing') {
        this.Playerstate = "Pause"; //etwas verwirrend, weil mit Playerstate "Pause" gemeint ist, dass das Pause-Symbol angezeigt werden soll
      }
      else if(testdisplay['State'] == 'Paused') {
        this.Playerstate = "Play"; //etwas verwirrend, weil mit Playerstate "Play" gemeint ist, dass das Play-Symbol angezeigt werden soll
      }
      else if(testdisplay['State'] == 'Paused') {
        this.Playerstate = "Stop"; //etwas verwirrend, weil mit Playerstate "Stop" gemeint ist, dass das Play-Symbol angezeigt werden soll
      }
    }
    */
  }

  async ngAfterViewInit() {

    //Ein Delay damit der Server Zeit hat auf das connect zu reagieren
    await this.delay(500);

    //Send getState to get current Playerdata to display at Player open
    var data = JSON.stringify({"Action": "getState"});
    this.mywebsocket.next(data);
    console.log("Jetzt");
  }
}
