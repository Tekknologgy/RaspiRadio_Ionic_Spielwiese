import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appMenu=[
    {title: 'Player',url:'/player',icon:"musical-note"},
    {title: 'Playlist Editor', url:'/playlisteditor',icon:"build"},
    {title: 'Radiostation Editor', url:'/radiostationeditor',icon:"construct"},
    {title: 'Upload Musik', url:'/upload',icon:"cloud-upload"},
    {title: 'Add User',url:'/adduser',icon:"person-add"},
    {title: 'Change User',url:'/login',icon:"contact"},
    {title: 'Settings', url:'/settings',icon:"cog"},
    {title: 'Help', url:'/help', icon:"help-circle"},
    {title: 'Credits', url:'/credits', icon:"bulb"}
  ]

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
