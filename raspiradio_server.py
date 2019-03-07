#!/usr/bin/env python
# WS server example
#

from mpd import MPDClient
from pathlib import Path
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
        try:
            # Websocket Nachricht empfangen & mit JSON parsen
            command = await websocket.recv()
            parsed_json = json.loads(command)
        
            # "Action" wird immer geschickt. Es enthält die
            # Information darüber, was zu tun ist... Dann werden
            # die entsprechenden Aktionen ausgeführt. Manche Aktionen
            # benötigen weitere Übergabewerte wie zB in "setVolume".
            # Andere, wie zB in Play, nicht.
            
            ### setVolume
            if parsed_json['Action'] == "setVolume":
                #print("JSON volume change")
                try:
                    client.setvol(parsed_json['newVolume'])
                except:
                    client.connect("localhost", 6600)
                    client.setvol(parsed_json['newVolume'])
                    #print("Exception")
            ### Play
            if parsed_json['Action'] == "Play":
                #print('JSON play')
                try:
                    client.play(1)
                except:
                    client.connect("localhost", 6600)
                    client.play(1)
                    #print("Exception")
            ### Pause
            if parsed_json['Action'] == "Pause":
                #print("JSON pause")
                try:
                    client.pause(parsed_json['PauseStatus'])
                except:
                    client.connect("localhost", 6600)
                    client.pause(parsed_json['PauseStatus'])
                    #print("Exception")
            ### Stop
            if parsed_json['Action'] == "Stop":
                #print("JSON Stop")
                try:
                    client.stop()
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    #print("Exception")
            ###Next
            if parsed_json['Action'] == "Next":
                print("Next")
                try:
                    #if client.playlistid(status['nextsongid']) != client.playlistid('NULL'):
                        print("try")
                        status = {}
                        status = client.status()
                        print("status")
                        songinfo_list = client.playlistid(status['nextsongid']) #???????
                        print(songinfo_list)
                        #songinfo_string = ''.join(str(e) for e in songinfo_list) #???????
                        #print(songinfo_string)
                        #songinfo = ast.literal_eval(songinfo_string) #???????
                        #print(songinfo)
                        command = {"Action": "State", "State": "Playing", "Title": "Servertest Next"}
                        #command = {"Action": "NEXT", "State": "Play", "Titel": songinfo['title']} #???????
                        dumped_json = json.dumps(command)
                        await websocket.send(dumped_json)
                        client.next()
                        print("JSON Next")
                    #else:
                        #client.playlistid(status['nextsongid']) == client.playlistid(status['previoussongid'])
                        #print("Error abgefangen")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ###Previous
            if parsed_json['Action'] == "Previous":
                print("Previous")
                try:
                    print("try")
                    status = {}
                    status = client.status()
                    print("status")
                    #songinfo_list = client.playlistid(status['nextsongid']) #???????
                    print("songinfo_list")
                    #songinfo_string = ''.join(str(e) for e in songinfo_list) #???????
                    #print(songinfo_string)
                    #songinfo = ast.literal_eval(songinfo_string) #??????
                    #print(songinfo)
                    command = {"Action": "State", "State": "Playing", "Title": "Servertest Previous"}
                    #command = {"Action": "Previous", "State": "Play", "Titel": songinfo['title']}
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    client.previous()
                    print("JSON Previous")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ####AddUsers
            if parsed_json['Action'] == "AddUser":
                #print("JSON Adduser before Try")
                try:
                    data = (parsed_json['Name']) + "," + (parsed_json['Color'])
                    #print("JSON Adduser nach json_parse")
                    path = '/home/pi/Python-Scripts/Userdatabase.txt'
                    useres_file = open(path, 'r+')
                    #print("JSON Adduser nach erstellung der  txt")
                    useres_file.write(data)
                    useres_file.close()
                    #print("JSON Adduser")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ### GetState
            if parsed_json['Action'] == "getState":
                #print("JSON GetState")
                try:
                    command = {"Action": "State","Title": "Server","Artist": "Send getState","Duration": 666,"Elapsed": 42,"Volume": 60,"State": "Playing"}
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    #print("JSON GetState send")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")

        except:
            #print("Exception")
            pass


# Hier wird der Websocket-Server gestartet
start_server = websockets.serve(hello, '192.168.0.10', 8765)

# Und das wird als Loop für die asynchronen Funktionen benötigt
# Wie es genau funktioniert, wissen wir noch nicht.
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

