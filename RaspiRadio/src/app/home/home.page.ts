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


  async conn_rasp() {
    if((this.ip & this.port) > 0){
      this.show_loading();
    }
    else this.err_report();
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
    const loading = await this.loadingCtrl.create({
      message:'Connecting...',
      duration:2000
    });
    /*
    const alert = await this.alertCtrl.create({
      header:'Verbindung Erfolgreich',
      buttons: [{
        text: 'Ok',
        handler: () => {
          alert.dismiss(false);
          this.navCtrl.navigateForward('/login');
        }
      }]
    });
    */
    //return await loading.present(),await alert.present();
    
    //await loading.onDidDismiss();
    //this.navCtrl.navigateForward('/login');
    
    return await loading.present();
  }
}
