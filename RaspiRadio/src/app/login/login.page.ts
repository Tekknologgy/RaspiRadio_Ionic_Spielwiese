import { Component, OnInit } from '@angular/core';
import { GlobalVarService, } from '../services/global-var.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public user=[
    {name:'Hautz Sebastian'},
    {name:'Lehner Roland'},
    {name:'Nessel Markus'}
  ]
  maxUser;
  constructor(public globalVarService: GlobalVarService) {}


  ngOnInit() {
    this.globalVarService.user;
  }
}
