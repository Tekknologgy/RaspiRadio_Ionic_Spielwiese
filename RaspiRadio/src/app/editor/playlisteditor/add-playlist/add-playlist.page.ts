import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-playlist',
  templateUrl: './add-playlist.page.html',
  styleUrls: ['./add-playlist.page.scss'],
})
export class AddPlaylistPage implements OnInit {
public playListSong=[
  {title:'Nothing Else Matters',interpret:'Metallica'},
  {title:'Walk the Line',interpret:'Jonny Cash'},
  {title:'Fight Fire with Fire',interpret:'Metallica'}
]
  constructor() { }

  ngOnInit() {
  }
}
