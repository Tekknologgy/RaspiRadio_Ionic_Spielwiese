import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-playlist',
  templateUrl: './add-playlist.page.html',
  styleUrls: ['./add-playlist.page.scss'],
})
export class AddPlaylistPage implements OnInit {
public playListSong=[
  {title:'Test',interpret:'testinterpret'},
  {title:'Test2',interpret:'testinterpret2'},
  {title:'Test3',interpret:'testinterpret3'}
]
  constructor() { }

  ngOnInit() {
  }
}
