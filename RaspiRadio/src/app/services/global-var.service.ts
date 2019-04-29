import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalVarService {
  /*public playlist = [
    {id:'1'},
    {playlistname:'Default'},
    {playlistuser:'Default'},
    {tracks:''}
  ];*/
  playlist = 'cra';
  public user=[
    {id:''},
    {username:''},
    {bgcolor:''},
    {playlistid:''}
  ]
  constructor() { }

  return(){this.playlist,this.user}
}
