import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'adduser', loadChildren: './adduser/adduser.module#AdduserPageModule' },
  { path: 'adduser', loadChildren: './adduser/adduser.module#AdduserPageModule' },
  { path: 'player', loadChildren: './player/player.module#PlayerPageModule' },
  { path: 'playlisteditor', loadChildren: './editor/playlisteditor/playlisteditor.module#PlaylisteditorPageModule' },
  { path: 'radiostationeditor', loadChildren: './editor/radiostationeditor/radiostationeditor.module#RadiostationeditorPageModule' },
  { path: 'upload', loadChildren: './upload/upload.module#UploadPageModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'help', loadChildren: './help/help.module#HelpPageModule' },
  { path: 'credits', loadChildren: './credits/credits.module#CreditsPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
