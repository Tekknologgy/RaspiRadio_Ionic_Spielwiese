import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ControlPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-control',
  templateUrl: 'control.html',
})
export class ControlPage {

  private time = 0;
  private newtime = "0:00:00";
  private icon = "musical-notes";
  
  onChange(ev: any) {
    //console.log('Changed', ev);
    //console.log(this.time);
    let hours;
    let minutes;
    let seconds;
    //console.log(this.time);
    
    seconds = this.time % 60
    minutes = Math.floor(this.time / 60);
    hours = Math.floor(minutes / 60);
      
    //Führende 0 wenn Sekunden < 10
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    //Bei jeder vollen Stunde bei 0 min beginnen
    if (hours >= 1) {
      minutes = minutes - (60 * hours);
    }
    //Führende Nullen für die Minuten
    if (minutes < 10) {
      minutes = '0' + minutes;
    }      
    //console.log(hours + ':' + minutes + ':' + seconds);
    this.newtime = hours + ':' + minutes + ':' + seconds;
  }
    
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ControlPage');
  }

}
