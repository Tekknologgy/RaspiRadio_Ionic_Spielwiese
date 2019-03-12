import { Component, OnInit } from '@angular/core';
import { ActionSheetController,NavController } from '@ionic/angular';

@Component({
  selector: 'app-playlisteditor',
  templateUrl: './playlisteditor.page.html',
  styleUrls: ['./playlisteditor.page.scss'],
})
export class PlaylisteditorPage implements OnInit {
  public playList=[
    {title:'playlist1'},
    {title:'playlist2'},
    {title:'playlist3'}
  ]
  constructor(public actionCtrl: ActionSheetController, public navCtrl: NavController) { }
  async optionPlaylist() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Option',
      buttons: [{
        text: 'Add Playlist',
        cssClass:'actionSheet',
        icon: 'add-circle-outline',
        handler: () => {
          this.navCtrl.navigateForward('/add-playlist');
        }
      }, {
        text: 'Edit Playlist',
        cssClass:'actionSheet',
        icon: 'construct',
        handler: () => {
          this.navCtrl.navigateForward('/change-playlist');
        }
      },{
        text: 'Delete Playlist',
        role: 'destructive',
        cssClass:'actionSheet',
        icon: 'trash',
        handler: () => {
          this.navCtrl.navigateForward('/add-playlist');
        }
      },{
        text: 'Cancel',
        cssClass:'actionSheet',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  ngOnInit() {
  }

}
