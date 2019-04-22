#!/usr/bin/env python
# WS server example
#

from mpd import MPDClient
from pathlib import Path
import json
import asyncio
import websockets
import ast

# Create, configure & connect MPD
client = MPDClient()
client.timeout = 3
client.connect("localhost", 6600)
client.update

def send_state():
    try:
        status = {}
        status = client.status()
        #print(status)
        
        randomstate = int(status['random'])
        #print(randomstate)
        
        repeatstate = int(status['repeat'])
        #print(repeatstate)
        
        X = int(status['songid'])
        songinfo_list = client.playlistid(X)
        songinfo_string = ''.join(str(e) for e in songinfo_list)
        songinfo = ast.literal_eval(songinfo_string)
        #print(songinfo)
        
        state = status['state']
        #print(state)
        
        command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['elapsed']),"Volume": (status['volume']),"State": state, "RandomState": (randomstate), "RepeatState": (repeatstate)}
        #print(command)
        
        dumped_json = json.dumps(command)
        #print("JSON GetState send")
        return dumped_json

    except:
        client.connect("localhost", 6600)
        status = {}
        status = client.status()
        #print(status)
        
        randomstate = int(status['random'])
        #print(randomstate)
        
        repeatstate = int(status['repeat'])
        #print(repeatstate)
        
        X = int(status['songid'])
        songinfo_list = client.playlistid(X)
        songinfo_string = ''.join(str(e) for e in songinfo_list)
        songinfo = ast.literal_eval(songinfo_string)
        #print(songinfo)
        
        state = status['state']
        #print(state)
        
        command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['elapsed']),"Volume": (status['volume']),"State": state, "RandomState": (randomstate), "RepeatState": (repeatstate)}
        #print(command)
        
        dumped_json = json.dumps(command)
        #print("JSON GetState send -In Except-")
        return dumped_json

async def hello(websocket, path):
    while True:
        try:
            # Websocket Nachricht empfangen & mit JSON parsen
            command = await websocket.recv()
            parsed_json = json.loads(command)

            status = {}
            status = client.status()
            playlistlength = status['playlistlength']
        
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
                    #await websocket.send(send_state())

                except:
                    client.connect("localhost", 6600)
                    client.play(1)
                    #print("Exception")
                    #await websocket.send(send_state())

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

            ### Next
            if parsed_json['Action'] == "Next":
                #print('Next')
                client.next()
                if playlistlength == playlistlength[-1]:
                    #client.play()
                    client.pause()
                await websocket.send(send_state())

            ###Previous
            if parsed_json['Action'] == "Previous":
                #print("Previous")
                client.previous()
                await websocket.send(send_state())

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
                    #print("JSON Adduser Exeption")
                    pass

            ### GetState
            if parsed_json['Action'] == "getState":
                await websocket.send(send_state())
                """
                
                """

            ###Random State ON
            if parsed_json['Action'] == "Random" and parsed_json['State'] == 1:
                #print("random")
                try:
                    client.random(int(1))

                except:
                    client.connect("localhost", 6600)
                    client.random(int(1))
                    #print("Random State ON Exception")
            
            ###Random State OFF
            if parsed_json['Action'] == "Random" and parsed_json['State'] == 0:
                #print("random")
                try:
                    client.random(int(0))

                except:
                    client.connect("localhost", 6600)
                    client.random(int(0))
                    #print("Random State OFF Exception")
            
            ###Repeat State ON
            if parsed_json['Action'] == "Repeat" and parsed_json['State'] == 1:
                #print("random")
                try:
                    client.repeat(int(1))

                except:
                    client.connect("localhost", 6600)
                    client.repeat(int(1))
                    #print("Repeat State ON Exception")
            
            ###Repeat State OFF
            if parsed_json['Action'] == "Repeat" and parsed_json['State'] == 0:
                #print("random")
                try:
                    client.repeat(int(0))

                except:
                    client.connect("localhost", 6600)
                    client.repeat(int(0))
                    #print("Repeat State OFF Exception")

            
            ###Await websocket.send(send_state()) for ech new song
            status = {}
            status = client.status()
            playlistlength = status['playlistlength']
            elapsed = status['elapsed']

            for length in playlistlength: 
                if playlistlength == playlistlength[-1]:
                    #client.play()
                    await websocket.send(send_state())
                else:
                    await websocket.send(send_state())
                
            

           
            ####New time on slidbar
            if parsed_json['Action'] == "setElapsed":
                #print("setElapsed")
                try:
                    new_time = parsed_json['newElapsed']
                    client.seekcur(int(new_time))
                    #print (new_time)
                    #client.pause(1)
                    #print("JSON setElapsed send")

                except:
                    client.connect("localhost", 6600)
                    new_time = parsed_json['newElapsed']
                    client.seekcur(int(new_time))
                    #print("New time on slidbar Exception")

            #### OK Connection-Dialog sending
            if parsed_json['Action'] == "ConnTest":
                #print("ConnTest")
                try:
                    #print("try")
                    command = {"Action": "ConnTest","Response": "OK"}
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    #print("OK Connection-Dialog send")
                    
                except:
                    #print("OK Connection-Dialog Exception")
                    pass

        except:
            #print("Exception")
            pass


# Hier wird der Websocket-Server gestartet
start_server = websockets.serve(hello, '192.168.0.10', 8765)

# Und das wird als Loop für die asynchronen Funktionen benötigt
# Wie es genau funktioniert, wissen wir noch nicht.
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()