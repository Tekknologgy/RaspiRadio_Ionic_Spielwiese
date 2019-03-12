import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage'; //Storage Import

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  ip = "teilchen.ddns.net";
  port = 8765;
  loading;
  
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl : NavController,
    private storage: Storage  //Das Inject fürs Storage
  ) {}

  async conn_rasp() {
    if((this.ip > "") && (this.port > 0)) {
      //placeholder function für conn test
      this.show_loading();

      //Hier werden die Daten im Storage gespeichert
      this.storage.set("ip", this.ip);
      this.storage.set("port", this.port);
      await this.delay(2000);   //wird ersetzt durch einen Funktionsaufruf der die Verbindung herstellt
    }
    else this.err_report();
    
    this.loading.dismiss();
    //if connection ok -> dismiss & nav to login
    //else dismiss & error
    //this.loading.dismiss();
  }

  //Ist verbunden mit dem storage_test Button
  async storage_test() {
    this.storage.get('ip').then((val) => {
      console.log('Your ip is ', val);
    });
    this.storage.get('port').then((val) => {
      console.log('Your port is ', val);
    });
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

  async show_loading() {
    this.loading = await this.loadingCtrl.create({
      message:'Connecting...',
    });
    return await this.loading.present();
  }
  
  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}