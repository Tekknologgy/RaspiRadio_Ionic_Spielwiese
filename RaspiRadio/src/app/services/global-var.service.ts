import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalVarService {
  public playlist = [
    {id:''},
    {playlistname:''},
    {playlistuser:''},
    {tracks:''}
  ];
  public user=[
    {id:''},
    {username:''},
    {bgcolor:''},
    {playlistid:''}
  ]
  constructor() { }

  return(){this.playlist,this.user}
}
