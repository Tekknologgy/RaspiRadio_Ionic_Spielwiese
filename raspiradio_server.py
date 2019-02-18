#!/usr/bin/env python
# WS server example

from mpd import MPDClient
import json
import asyncio
import websockets

# Create, configure & connect MPD
client = MPDClient()
client.timeout = 3
client.connect("localhost", 6600)
client.update

async def hello(websocket, path):
    while True:
        # Websocket Nachricht empfangen & mit JSON parsen
        command = await websocket.recv()
        parsed_json = json.loads(command)
        
        # "Action" wird immer geschickt. Es enthält die
        # Information darüber, was zu tun ist... Dann werden
        # die entsprechenden Aktionen ausgeführt. Manche Aktionen
        # benötigen weitere Übergabewerte wie zB in "setVolume".
        # Andere, wie zB in Play, nicht.
        if parsed_json['Action'] == "setVolume":
            client.setvol(parsed_json['newVolume'])
            print("JSON volume change")
        if parsed_json['Action'] == "Play":
            client.play(1)
            print('JSON play')
        if parsed_json['Action'] == "Pause":
            client.pause(parsed_json['PauseStatus'])
            print("JSON pause")
        if parsed_json['Action'] == "Stop":
            client.stop()
            print("JSON Stop")

# Hier wird der Websocket-Server gestartet
start_server = websockets.serve(hello, '192.168.0.10', 8765)

# Und das wird als Loop für die asynchronen Funktionen benötigt
# Wie es genau funktioniert, wissen wir noch nicht.
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
