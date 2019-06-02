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

  async weiter_test() {
    this.router.navigate(['/player']);
  }

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
    
    await this.show_loading("Loading...");  //zeige den Lade-Bildschirm
    this.wsService.register(this);
    this.conn_rasp("OnInit"); //Ruft die Funktion conn_rasp() im Kontext "InInit" auf
  }
}