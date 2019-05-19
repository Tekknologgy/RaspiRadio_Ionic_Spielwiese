import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WSSubscriberService {
  /* #region Private Members */

  private pageList: { [name: string]: any } = {};
  private retryInterval = 2000;

  public URL: string = "";

  /* #endregion */

  /* #region Constructor */

  constructor(private ws: WebsocketService, private router: Router) { }

  /* #endregion */

  /* #region Private Methods */

  /**
   * Hier subscriben wir einfach unser socket$ und setzen die Maßnahmen für die einzelnen Methoden (next, error, completed)
   * Wenn die Verbindung verloren gehen/scheitern oder beendet werden sollte (error, complete), wird unsere Methode Reconnect ausgeführt.
   * Wie du siehst, habe ich hier versucht einen retryCounter einzubauen. Warum ich beim Erhalt einer Nachricht den Counter auf 0 setze
   * hat natürlich einen Grund, den schreibe ich aber bei der Reconnect Methode.
   */
  public subscribe(url = "") {
    if(url != "")
      this.URL = url;

    if(this.ws.socket$ == null)
      this.ws.connect(this.URL);
    
    this.ws.socket$.subscribe(
      message => {
        if (this.pageList[this.router.url] != null)
          this.pageList[this.router.url].OnMessage(message);
      },
      () => this.resubscribe(),
      () => this.resubscribe()
    );
  }

  /**
   * Das await ist quasi ein "Sleep", also wir warten einfach 2 Sekunden und führen erst dann den Code darunter aus.
   * Hier rufen wir die Connect Funktion unseres WebSocketServices auf, die versucht die Verbindung zum Server
   * wiederherzustellen und anschließend die Subscribe Funktion, damit wir wieder Nachrichten empfangen können. Sollte aber die Verbindung nach wie
   * vor nicht vorhanden sein, wird Reconnect erneut ausgeführt (da ein error bei der subscription geworfen wird und wir beim subscriben sagten, dass
   * er bei einem Fehler die Reconnect Methode aufrufen soll.)
   */
  private async resubscribe() {
    await new Promise((r) => { setTimeout(r, this.retryInterval); });
    this.ws.connect(this.URL);
    this.subscribe();
  }

  /* #endregion */

  /* #region Public Methods */

  /**
   * Die Register Methode muss bei jeder (in meinem Fall, aufgrund der Projektvorlage "tabs") *.page.ts Datei im Konstruktor aufgerufen werden.
   * Wir haben oben unsere private Variable pageList, welche nichts anderes als ein implementiertes Dictionary ist.
   * Der Key hierbei ist die URL des Tabs (bei Tab1 z.B. /tabs/tab1)
   * Und der Value ist die Instanz der Seite. Man hat also ein Objekt der Klasse "Tab1Page" (von Tab1 ausgehend). Das könnte bei riesigen Klassen
   * vielleicht Performance-Probleme verursachen, aber das ist bisher die einzige Lösung, die ich gefunden hab. Eventuell könnte man mit Events
   * oder so arbeiten, aber so riesig werden unsere Klassen zumindest nicht und soviele Seiten haben wir im Endeffekt auch nicht (wir haben 4),
   * also ist es, zumindest für uns, akzeptabel. Aber ich lass mir bei Gelegenheit was anderes einfallen.
   * 
   * @param pageRef Die Instanz der Seite, welche registriert werden soll
   */
  public register(pageRef) {
    this.pageList[this.router.url] = pageRef;
    console.log(`${this.router.url} registered`)
  }

  /**
   * Hier einfach eine SendMethode die, erneut, ein Dictionary als Übergabeparameter erwartet.
   * Das Dictionary senden wir dann einfach per Next an das Subject, wobei hier durch das WebSocketSubject
   * die Nachricht automatisch in JSON verwandelt wird.
   * 
   * @param message Die Nachricht, welche versendet werden soll, in Form eines Dictionaries [Key: string, Value: string]
   */
  public send(message: { [key: string]: any; }) {
    this.ws.socket$.next(message);
    console.log(`Outgoing: ${JSON.stringify(message)}`);
  }

  /* #endregion */
}
