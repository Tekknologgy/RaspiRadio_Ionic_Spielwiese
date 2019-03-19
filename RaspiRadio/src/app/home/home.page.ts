import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WebsocketService } from '../services/websocket.service';
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
  private mywebsocket;
  private connected = false;
  
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    private storage: Storage,
    private wsService: WebsocketService,
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
  
  async conn_rasp(origin: string) {
    if (origin == "Button") { //Wenn der Button die Funktion aufgerufen hat
      if((this.ip > "") && (this.port > 0)) {   //Wenn in den Feldern etwas steht, zeige Lade-Bildschirm
        this.show_loading();  
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
        }
        else {  //Wenn keine IP vorhanden
          return; //Aus conn_rasp() aussteigen
        }
      });
      await this.storage.get('port').then((val) => {  //Rufe Port aus dem Storage ab
        if (val) {  //Wenn Port vorhanden
          this.port = val;  //ins Feld schreiben und in der lokalen Variable "port" speichern
        }
        else {  //Wenn kein Port vorhanden
          return; //Aus conn_rasp() aussteigen
        }
      });
    }

    //Gilt für "OnInit" genauso wie für "Button"
    this.mywebsocket = this.wsService.connect("ws://" + this.ip + ":" + this.port); //Connect
    this.mywebsocket.subscribe( //Subscribe to incoming Messages (wird erst durchlaufen, wenn eine Nachricht eingeht)
      (next) => {
        let parsed = JSON.parse(next.data);
        if((parsed['Action'] == 'ConnTest') && (parsed['Response'] == 'OK')) {  //Wenn vom Server ein OK zurückgekommen ist
          this.connected = true;  //Setze "connected" auf True (Eine Subscription ist eine asynchrone Funktion - deshalb eine bool zur Hilfe)
        }
      }
    )
    await this.delay(500);  //Delay, damit der Raspi Zeit hat die Verbindung aufzubauen
    var data = JSON.stringify({"Action": "ConnTest"});
    this.mywebsocket.next(data);  //Start des Verbindungs-Tests
    await this.delay(2000); //Timeout für das Warten auf die Antwort
    if (this.connected == true) { //Wenn in der Zwischenzeit durch das Subscribe bei einer eingehenden Nachricht "connected" auf True gesetzt wurde
      this.loading.dismiss(); //Entfernen des Lade-Bildschirms
      
      //Wenn die Verbindung durch den Button aufgebaut wurde, speichere die Daten aus den Feldern im Storage und leite an den Player weiter
      if (origin == "Button") {
        this.storage.set("ip", this.ip);
        this.storage.set("port", this.port);
        this.router.navigate(['/player']);
      }
      //Wenn die Verbindung durch Daten aus dem Storage bei "OnInit" aufgebaut wurde leite sofort zum Player weiter
      if (origin == "OnInit") {
        this.router.navigate(['/player']);
      }
    }
    else this.err_report(); //Wenn nach 2000ms Verbindungstimeout die lokale Variable "connected" immer noch auf False steht, wird eine Fehlermeldung angezeigt.
  }

  //Ist mit dem Button "Weiter zu Testzwecken" verbunden, welcher auskommentiert ist
  /*
  async weiter_test() {
    this.router.navigate(['/player']);
  }
  */

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

    this.conn_rasp("OnInit"); //Ruft die Funktion conn_rasp() im Kontext "InInit" auf

  }

}