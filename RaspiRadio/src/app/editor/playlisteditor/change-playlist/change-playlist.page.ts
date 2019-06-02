import { Component, OnInit } from '@angular/core';
import { ActionSheetController,NavController } from '@ionic/angular';
//import { GlobalVarService } from '././services/global-var.service';

@Component({
  selector: 'app-change-playlist',
  templateUrl: './change-playlist.page.html',
  styleUrls: ['./change-playlist.page.scss'],
})
export class ChangePlaylistPage implements OnInit {
  public playListSong=[
    {title:'Nothing Else Matters',interpret:'Metallica'},
    {title:'Walk the Line',interpret:'Jonny Cash'},
    {title:'Fight Fire with Fire',interpret:'Metallica'}
  ]
  constructor(//public globalVarService: GlobalVarService
    public actionCtrl: ActionSheetController
    ,public navCtrl: NavController) { 
  }
  async optionPlaylist() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Option',
      buttons: [{
        text: 'Change Position',
        cssClass:'actionSheet',
        icon: 'menu',
        /*handler: () => {
          this.navCtrl.navigateForward('/add-playlist');
        }*/
      },{
        text: 'Delete Song',
        role: 'destructive',
        cssClass:'actionSheet',
        icon: 'trash',
       /* handler: () => {
          this.navCtrl.navigateForward('/add-playlist');
        }*/
      }]
    });
    await actionSheet.present();
  }
  ngOnInit() {
    //this.globalVarService.playlist;
    //console.log(this.globalVarService.playlist);
  }
}
