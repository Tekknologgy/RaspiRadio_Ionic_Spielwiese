import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navCtrl : NavController) { }
  loading;
  Songname;
  Songduration;
  durationtest;

  async test(){
    this.show_loading();
    await this.delay(2000);
    this.loading.dismiss();
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

  songdur(){
    let start = Date.now();
    let millis = Date.now() - start;
    setTimeout(function(){ 
      while(this.durationtest <= this.Songduration){
        this.durationtest++;
      }
    }, 1000);
  }

  async songval(){
    let min:number;
    min = 3;
    let max:number;
    max = 10;
    this.Songduration = Math.random() * (max - min) +max;
    this.songdur();

  }
  ngOnInit() {
    this.Songname = "test";
    this.songval();

  }

}
