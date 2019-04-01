import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
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

  //Zu Beginn wird ein Ladebildschirm angezeigt

  //Wenn IP & Port im Storage vorhanden sind, soll eine Nachricht an den Server geschickt werden.
  //Wenn dieser mit einem OK antwortet, soll der Lade-Bildschirm verschwinden und sofort zum Player weitergeleitet werden.
  
  //Sind keine Daten im Storage, soll ein Connect über den Button ermöglicht werden. Dann sollen die Eingabefelder leer sein.
  //Sind gespeicherte Daten vorhanden aber inkorrekt, dann soll eine Fehlermeldung angezeigt werden.
  //Die Eingabefelder enthalten dann die gespeicherten inkorrekten Daten.

  //Sind die Daten in den Eingabefeldern inkorrekt und es wird "Connect" geklickt, dann soll eine Fehlermeldung erscheinen
  //und eine erneute Eingabe möglich sein.

  //Nachdem die Anzeige aufgebaut wurde, wird zuerst die "Loading..." Animation gestartet und dann
  //darauf gewartet dass das Storage bereit ist.
  //Bevor die Funktion "conn_rasp" aufgerufen wird, werden noch eingehende Nachrichten am WebsocketService abonniert.
  //Im conn_rasp wird dann unterschieden, ob die Funktion aus dem Init oder vom Button aufgerufen wurde.

  //Die Funktion OnMessage ist die CallBack-Funktion die ausgeführt wird, sobald eine neue Nachricht am Websocket eingeht.
  //Wenn eine Antwort vom Server eingeht, wird ein eventuell vorhandenes "Loading..." entfernt, die korrekten Daten im Storage
  //gespeichert und dann zum Player weitergeleitet. Die Funktion OnMessage ist Public, damit man auf sie auch zugreifen kann,
  //wenn man in einer anderen Page ist. Da Problem ist dass jede Page, die eingehende Nachrichten abonniert hat, neue Nachrichten
  //erhält, auch wenn die Seite gerade nicht angezeigt wird. Ist man gerade am debuggen und lässt sich eingehende NAchrichten anzeigen
  //erscheint jede eingehende Nachricht ein mal für jede Page die abonniert hat. Wenn allerdings der letzte Abonnent sein Abo kündigt,
  //wird auch die Verbindung getrennt. Also muss man beim Seiten wechseln, zuerst die neue Seite abonnieren und dann von allen anderen
  //Pages das Abo lösen.

  public OnMessage(message) {
    if((message["Action"] == "ConnTest") && (message["Response"] == "OK")) {
      console.log(`Incoming: ${JSON.stringify(message)}`);
      this.storage.set("ip", this.ip);
      this.storage.set("port", this.port);
      if(this.loading.present()) {
        this.loading.dismiss();
      }
      this.router.navigate(['/player']);
    }
  }
  
  async conn_rasp(origin: string) {
    if (origin == "Button") { //Wenn der Button die Funktion aufgerufen hat
      if((this.ip > "") && (this.port > 0)) {   //Wenn in den Feldern etwas steht, zeige Lade-Bildschirm
        this.ipPresent = true;
        this.portPresent = true;
        //await this.show_loading("Button");
        console.log("Show loading");
      }
      else {  //Sonst zeige einen Fehler und steige aus der kompletten conn_rasp() Funktion aus
        this.err_report();
        return;
      }
    }
    if (origin == "OnInit") { //Wenn die Funktion aus dem OnInit aufgerufen wurde
      await this.storage.get('ip').then((val) => {  //Rufe IP aus dem Storage ab
        if (val > "") {  //Wenn IP vorhanden
          this.ip = val;  //ins Feld schreiben und in der lokalen Variable "ip" speichern
          this.ipPresent = true;
        }
        else {  //Wenn keine IP vorhanden
          this.ipPresent = false;
        }
      });
      await this.storage.get('port').then((val) => {  //Rufe Port aus dem Storage ab
        if (val > "") {  //Wenn Port vorhanden
          this.port = val;  //ins Feld schreiben und in der lokalen Variable "port" speichern
          this.portPresent = true;
        }
        else {  //Wenn kein Port vorhanden
          this.portPresent = false;
        }
      });
    }
    
    if(this.ipPresent == false && this.portPresent == false) {
      if(this.loading.present()) {
        this.loading.dismiss();
      }
      return;
    }

    this.wsService.subscribe("ws://" + this.ip + ":" + this.port);
    
    var data = {"Action": "ConnTest"};
    this.wsService.send(data);
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

  async show_loading(text: string) {
    this.loading = await this.loadingCtrl.create({
      message: text,
    });
    return await this.loading.present();
  }
  
  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async ngAfterViewInit() {
    await this.storage.ready;
    
    //Dient nur zum Testen des Local Storage
    //Wird es einkommentiert, dann wird bei Programmstart das Storage gelöscht.
    // this.storage.remove("ip");
    // this.storage.remove("port");
    // this.storage.clear;
    
    await this.show_loading("Loading...");  //zeige den Lade-Bildschirm
    this.wsService.register(this);
    this.conn_rasp("OnInit"); //Ruft die Funktion conn_rasp() im Kontext "InInit" auf
  }
}