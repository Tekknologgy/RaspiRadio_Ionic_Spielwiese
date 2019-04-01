import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WebsocketService } from '../services/websocket.service';
import { WSSubscriberService } from "../services/wssubscriber-service.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //ip = "teilchen.ddns.net";
  ip;
  //port = 8765;
  port;
  loading;
  error = false;
  ipPresent = false;
  portPresent = false;
  connectionSuccess = false;
  
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    private storage: Storage,
    private wsService: WSSubscriberService,
    private router: Router
  ) {}

  //Wenn IP & Port im Storage vorhanden sind, soll die Verbindung geprüft werden.
  //Währenddessen soll ein Lade-Bildschirm angezeigt werden. Das Timeout beträgt 2000ms.
  //Wenn die Verbindung funktioniert, soll der Lade-Bildschirm verschwinden und sofort zum Player weitergeleitet werden.
  //Wenn die Verbindung nicht funktioniert, soll eine Fehlermeldung erscheinen, die Daten aus dem Storage in den Feldern stehen
  //und ein Connect über den Button ermöglicht werden.

  //Wenn der Connect-Dialog angezeigt wird (keine oder falsche Daten im Storage) soll nach dem Klick auf den Connect-Button
  //die Eingabe mit einem Verbindungstest überprüft werden, während ein Lade-Bildschirm mit 2000ms Timeout angezeigt wird.
  //Schlägt der Test fehl, soll eine Fehlermeldung erscheinen und die Eingabe korrigiert werden können.
  //Funktioniert der Verbindungstest,soll der Lade-Bildschirm verschwinden, die Daten werden im Storage gespeichert
  //und es wird sofort zum Player weitergeleitet.

  //Da beide Aufgaben sehr ähnlich sind, habe ich EINE Funktion geschrieben, die beides macht.
  //Zum Unterscheiden wird der Funktion ein String übergeben. Der enthält entweder "OnInit" oder "Button".
  //Innerhalb der Funktion werden dann großteils die selben Dinge getan. Dort, wo jedoch unterschiedliche Dinge zu tun sind
  //differenziere ich zwischen "OnInit" und "Button".

  public OnMessage(message) {
    if((message["Action"] == "ConnTest") && (message["Response"] == "OK")) {
      console.log("Hat gefunzt");
      this.storage.set("ip", this.ip);
      this.storage.set("port", this.port);
      this.loading.dismiss();
      this.router.navigate(['/player']);
    }
  }
  
  async conn_rasp(origin: string) {
    if (origin == "Button") { //Wenn der Button die Funktion aufgerufen hat
      if((this.ip > "") && (this.port > 0)) {   //Wenn in den Feldern etwas steht, zeige Lade-Bildschirm
        this.ipPresent = true;
        this.portPresent = true;
        this.show_loading();
        console.log("Show loading");
      }
      else {  //Sonst zeige einen Fehler und steige aus der kompletten conn_rasp() Funktion aus
        this.err_report();
        return;
      }
    }
    if (origin == "OnInit") { //Wenn die Funktion aus dem OnInit aufgerufen wurde
      this.show_loading();  //zeige den Lade-Bildschirm
      await this.storage.get('ip').then((val) => {  //Rufe IP aus dem Storage ab
        if (val) {  //Wenn IP vorhanden
          this.ip = val;  //ins Feld schreiben und in der lokalen Variable "ip" speichern
          this.ipPresent = true;
        }
        else {  //Wenn keine IP vorhanden
          this.ipPresent = false;
        }
      });
      await this.storage.get('port').then((val) => {  //Rufe Port aus dem Storage ab
        if (val) {  //Wenn Port vorhanden
          this.port = val;  //ins Feld schreiben und in der lokalen Variable "port" speichern
          this.portPresent = true;
        }
        else {  //Wenn kein Port vorhanden
          this.portPresent = false;
        }
      });
    }
    
    if(this.ipPresent == false && this.portPresent == false) {
      this.loading.dismiss();
      return;
    }

    this.wsService.subscribe("ws://" + this.ip + ":" + this.port);
    
    var data = {"Action": "ConnTest"};
    this.wsService.send(data);

    // //Gilt für "OnInit" genauso wie für "Button"
    // this.wsService.connect("ws://" + this.ip + ":" + this.port); //Connect
    
    // console.log("Subscribing...");
    // HomePage.Subscription = this.wsService.socket$.subscribe(
    //   (next) => {
    //     if((next["Action"] == "ConnTest") && (next["Response"] == "OK")) {
    //       console.log("Hat gefunzt");
    //       this.storage.set("ip", this.ip);
    //       this.storage.set("port", this.port);
    //       this.loading.dismiss();
    //       HomePage.Subscription.unsubscribe();
    //       this.router.navigate(['/player']);
    //     }
    //   },
    //   (error) => console.log("Error: " + error),
    //   (complete) => console.log("Complete" + complete)
    // );
    
    // //var data = {"Plugin": "LinkSharingSystem"};
    // console.log("Sending...");
    // var data = {"Action": "ConnTest"};
    // this.wsService.socket$.next(data);  //Start des Verbindungs-Tests
  }

  //Ist mit dem Button "Weiter zu Testzwecken" verbunden, welcher auskommentiert ist

  async weiter_test() {
    this.router.navigate(['/player']);
  }


  //Ist verbunden mit dem storage_test Button
  /*
  async storage_test() {
    this.storage.get('ip').then((val) => {
      console.log('Your ip is ', val);
    });
    this.storage.get('port').then((val) => {
      console.log('Your port is ', val);
    });
  }
  */

  async err_report() {
    const alert = await this.alertCtrl.create({
      header: 'Verbindung Fehlgeschlagen',
      buttons: [{
        text: 'Daten erneut eingeben',
        handler: () => {
          alert.dismiss(false);
        }
      }]
    });
    return await alert.present();
  }

  async show_loading() {
    this.loading = await this.loadingCtrl.create({
      message:'Connecting...',
    });
    return await this.loading.present();
  }
  
  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async ngOnInit() {

    // this.storage.remove("ip");
    // this.storage.remove("port");
    this.wsService.register(this);
    this.conn_rasp("OnInit"); //Ruft die Funktion conn_rasp() im Kontext "InInit" auf

  }

}