import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navCtrl : NavController) {

  }
  port;
  ip;
  loading;

  async conn_rasp() {
    if((this.ip & this.port) > 0) {
      //placeholder function für conn test
      this.show_loading();
      await this.delay(2000);   //wird ersetzt durch einen Funktionsaufruf der die Verbindung herstellt
    }
    else this.err_report();
    
    this.loading.dismiss();
    //if connection ok -> dismiss & nav to login
    //else dismiss & error

    //this.loading.dismiss();
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

    
