import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.page.html',
  styleUrls: ['./adduser.page.scss'],
})
export class AdduserPage implements OnInit {
  public value;
  constructor() { }
  
  
 async getColor($event) { 
  console.log($event.target.id);
  await console.log($event.target.id);
  await console.log(this.value);
   console.log("test");
  }
  ngOnInit() {
  }
}
