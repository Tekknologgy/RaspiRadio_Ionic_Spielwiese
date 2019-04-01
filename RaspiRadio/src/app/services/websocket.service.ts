import { Injectable } from '@angular/core';
import { webSocket } from "rxjs/webSocket";
//import 'rxjs/add/operator/catch';
//import 'rxjs/add/observable/throw';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  public socket$;
  public IsConnected: boolean = false;

  public connect(url) {
    this.socket$ = webSocket({
      url: url,
      openObserver: {
        next: () => {
          this.IsConnected = true;
          console.log("Connected!");
        }
      },
      closeObserver: {
        next: () => {
          if (this.IsConnected) {
            this.IsConnected = false;
            console.error("---------------- Connection lost... ----------------");
          }
        }
      }
    });
  }
}
