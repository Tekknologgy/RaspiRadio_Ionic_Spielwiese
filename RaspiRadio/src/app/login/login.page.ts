import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user;
  constructor() {
}

  ngOnInit() {
    for(let e of this.user){
      console.log(e);
    }
  }
}
