import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalVarService {
 
  constructor() { }
  test1: any;
  return(){this.test1}
}
