import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, LoadingController,MenuController} from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navCtrl : NavController, public menCtrl: MenuController) { }
  loading; 
  Songname;
  Songduration;
  currsongtime;
  songtime;
  seconds;
  minutes;
  hours;
  Playerstate;
  currDuration;

  async backward(){  //function von backward (backend muss noch eingebaut werden)
    this.backward_test();
    await this.delay(2000);
    this.loading.dismiss();
  }
  async backward_test() {
    this.loading = await this.loadingCtrl.create({
      message:'backwards',
    });
    return await this.loading.present();
  }

  async playpause(){  //toggle function von play und pause mit ändern des symbols und des labels (backend muss noch eingebaut werden)
    this.playpause_test();
    await this.delay(2000);
    this.loading.dismiss();
    if(this.Playerstate == 'Play'){
      this.Playerstate = 'Pause';
      await console.log(this.Playerstate);
    }else if(this.Playerstate == 'Pause'){
      this.Playerstate = 'Play';
      await console.log(this.Playerstate);
    }
  }
  async playpause_test() {
    this.loading = await this.loadingCtrl.create({
      message:'play',
    });
    return await this.loading.present();
  }
  async stop(){ //function von stop (backend muss noch eingebaut werden)
    this.stop_test();
    await this.delay(2000);
    this.loading.dismiss();
  }
  async stop_test() {
    this.loading = await this.loadingCtrl.create({
      message:'stop',
    });
    return await this.loading.present();
  }
  async forward(){ //function von forward (backend muss noch eingebaut werden)
    this.forward_test();
    await this.delay(2000);
    this.loading.dismiss();  
  }
  async forward_test() {
    this.loading = await this.loadingCtrl.create({
      message:'foward',
    });
    return await this.loading.present();
  }
  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async songdur(){ //hier wird er nochmal kontrolliert bzgl führender 0en etc und ausgegeben
    if(this.seconds < 10){
      this.seconds = '0'+this.seconds;
      //console.log(this.minutes+"sekunden kontrolle");
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

  ngOnInit() {
    this.Songname = "test";
    this.songval();
    this.test();
    this.Playerstate = 'Play';
  }
}
