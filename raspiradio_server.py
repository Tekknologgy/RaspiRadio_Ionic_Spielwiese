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
<<<<<<< HEAD

=======
"""
>>>>>>> 56eaea3257395738052415799c8db1a15e17e9ee
async def send_State():
    try:
        #print("try")
        status = {}
        status = client.status()
        #print(status)
        X = int(status['songid'])
        #print(X)
        songinfo_list = client.playlistid(X)#songid : Y
        #print(songinfo_list)
        songinfo_string = ''.join(str(e) for e in songinfo_list)
        #print(songinfo_string)
        songinfo = ast.literal_eval(songinfo_string)
        #print(songinfo)
        command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['time']),"Volume": (status['volume']),"State": "Playing"}
        #print(command)
        dumped_json = json.dumps(command)
        await websocket.send(dumped_json)
        #print("JSON GetState send")
    except:
        client.connect("localhost", 6600)
        client.stop()
        print("Exception")
<<<<<<< HEAD

=======
"""
>>>>>>> 56eaea3257395738052415799c8db1a15e17e9ee
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
                #print("Next")
                try:
                    #print("try")
                    client.next()
                    #print("JSON Next")
                    status = {}
                    status = client.status()
                    #print(status)
                    X = int(status['songid'])
                    #print(X)
                    songinfo_list = client.playlistid(X)#songid : Y
                    #print(songinfo_list)
                    songinfo_string = ''.join(str(e) for e in songinfo_list)
                    #print(songinfo_string)
                    songinfo = ast.literal_eval(songinfo_string)
                    #print(songinfo)
                    command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['time']),"Volume": (status['volume']),"State": "Playing"}
                    #print(command)
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    #print("JSON Next send")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ###Previous
            if parsed_json['Action'] == "Previous":
                #print("Previous")
                try:
                    #print("try")
                    client.previous()
                    #print("JSON Previous")
                    status = {}
                    status = client.status()
                    #print(status)
                    X = int(status['songid'])
                    #print(X)
                    songinfo_list = client.playlistid(X)#songid : Y
                    #print(songinfo_list)
                    songinfo_string = ''.join(str(e) for e in songinfo_list)
                    #print(songinfo_string)
                    songinfo = ast.literal_eval(songinfo_string)
                    #print(songinfo)
                    command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['time']),"Volume": (status['volume']),"State": "Playing"}
                    #print(command)
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    #print("JSON Previous send")
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
<<<<<<< HEAD
                """#print("JSON GetState")
=======
                #print("JSON GetState")
>>>>>>> 56eaea3257395738052415799c8db1a15e17e9ee
                try:
                    #print("try")
                    status = {}
                    status = client.status()
                    #print(status)
                    
                    ################################################################
                    #Zuesrt Queue leeren, danach Playlist laden und in der Playlist 'song': 'X', für nötige Daten auslesen
                    #'song' : 'X' = client.playlistid(INT)
                    #mpc clear ###löscht alle Titel(und somit Playlist) im derzeitigen Queue
                    #mpc load Testplaylist
                    #mpc play
                    
                    ##print (status['playlist'])#String
                    ##print(client.playlistid(0))
                    ##songinfo_list = (status['playlist'])
                    #songinfo_list = client.playlistid(int(16))
                    #songinfo_list = client.playlist(status['playlist'])
                    
                    ###client.clear()
                    ###client.load('Testplaylist')
                    ###client.play()
                    ##print(status)
                    ##print(status['song'])
                    #################################################################
                    
                    X = int(status['songid'])
                    #print(X)
                    songinfo_list = client.playlistid(X)#songid : Y
                    #print(songinfo_list)
                    songinfo_string = ''.join(str(e) for e in songinfo_list)
                    #print(songinfo_string)
                    songinfo = ast.literal_eval(songinfo_string)
                    #print(songinfo)
                    command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['time']),"Volume": (status['volume']),"State": "Playing"}
                    #print(command)
                    dumped_json = json.dumps(command)
                    await websocket.send(dumped_json)
                    #print("JSON GetState send")
                except:
                    client.connect("localhost", 6600)
                    client.stop()
<<<<<<< HEAD
                    print("Exception")"""
                await send_State()
=======
                    print("Exception")
                """await send_State()"""
>>>>>>> 56eaea3257395738052415799c8db1a15e17e9ee
            ###Random
            if parsed_json['Action'] == "Random":
                #print("random")
                try:
                    #print("try")
                    status = {}
                    status = client.status()
                    #print(status)
                    randomstate = (status['random'])
                    #print(randomstate)
                    if randomstate == '0':
                        client.random(int(1))
                        #print("JSON random on")
                        #print(randomstate)
                    elif randomstate == '1':
                        client.random(int(0))
                        #print("JSON random off")
                        #print(randomstate)
                    else:
                        print("Error Random")
                        #print(randomstate)
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ###Repeat
            if parsed_json['Action'] == "Repeat":
                #print("Repeat")
                try:
                    #print("try")
                    status = {}
                    status = client.status()
                    #print(status)
                    repeatstate = (status['repeat'])
                    #print(repeatstate)
                    if repeatstate == '0':
                        #client.repeat(int(1))
                        print("JSON repeat on")
                        #print(repeatstate)
                    elif repeatstate == '1':
                        client.repeat(int(0))
                        #print("JSON repeat off")
                        #print(repeatstate)
                    else:
                        print("Error Repeat")
                        #print(repeatstate)
                except:
                    client.connect("localhost", 6600)
                    client.stop()
                    print("Exception")
            ####New time on slidbar
            if parsed_json['Action'] == "setElapsed":
                #print("setElapsed")
                try:
                    #print("try")
                    status = {}
                    status = client.status()
                    #print("status")
                    new_time = parsed_json['newElapsed']
                    #print (new_time)
                    
                    ######################################################
                    #client.seek(new_time)
                    #client.seek(parsed_json['newElapsed'])
                    #client.setvol(parsed_json['newVolume'])
                    #songinfo_list = client.playlistid(status['nextsongid']) #???????
                    #print("songinfo_list")
                    #songinfo_string = ''.join(str(e) for e in songinfo_list) #???????
                    #print(songinfo_string)
                    #songinfo = ast.literal_eval(songinfo_string) #??????
                    #print(songinfo)
                    #command = {"Action": "State", "State": "Playing", "Title": "Servertest Previous"}
                    #command = {"Action": "Previous", "State": "Play", "Titel": songinfo['title']}
                    ##########################################################
                    
                    #print("JSON setElapsed send")
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

