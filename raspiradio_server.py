#!/usr/bin/env python
# RaspiRadio - A Beckend for a MPD Remotecontrol

# For Debugging use debug("message")
# For Errorlogging in Exceptions get the occuring line and call the function error(<message>, <line>)
#    except Exception as e:
#        lineno = sys.exc_info()[-1].tb_lineno
#        error(str(e), lineno)

import asyncio
import websockets, json
import inspect, logging, sys, traceback
import ast, time, _thread
from mpd import MPDClient, MPDError, CommandError

# print(len(sys.argv))		Count of arguments
# There is always ONE argument. The name of the called Python-Script.
# print(sys.argv[0])		The name of the called script file

#####################################################
### Commandline-Arguments & logging Configuration ###
### INFO, DEBUG                                   ###
#####################################################
if len(sys.argv) > 1:
    if sys.argv[1] == "debug":
        logging.getLogger().setLevel(logging.DEBUG)
    elif sys.argv[1] == "info":
        logging.getLogger().setLevel(logging.INFO)
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s')

########################################
### Websocket-Server Connection data ###
########################################
ws_host = "192.168.1.35"
ws_port = 8765

##################################
### MPD-Server Connection data ###
##################################
mpd_host = "localhost"
mpd_port = 6600

########################
### Global variables ###
########################
USERS = set()
client = MPDClient()
updateElapsedRunning = False
checkSongChangedRunning = False
newElapsed = False

###############
### Logging ###
###############
def debug(message):
    "Automatically log the current function details."
    # Get the previous frame in the stack, otherwise it would
    # be this function!!!
    func = inspect.currentframe().f_back.f_code
    #tb = sys.exc_info()[2]
    
    # Dump the message + the name of this function to the log.
    logging.debug("%s: %s in %s:%i" % (
        message, 
        func.co_name, 
        func.co_filename, 
        func.co_firstlineno
    ))

def error(message, lineno):
    "Automatically log the current function details."
    # Get the previous frame in the stack, otherwise it would
    # be this function!!!
    func = inspect.currentframe().f_back.f_code
    #tb = sys.exc_info()[2]
    # Dump the message + the name of this function to the log.
    logging.error("%s: %s in %s:%i raised in line %s" % (
        message, 
        func.co_name, 
        func.co_filename, 
        func.co_firstlineno,
        lineno
    ))

#####################
### MPD functions ###
#####################
def mpd_init():
    global client
    try:
        client.connect(mpd_host, mpd_port)
        client.update()
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except ConnectionRefusedError as cre:
        lineno = sys.exc_info()[-1].tb_lineno
        error("Connection Error: " + str(cre), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

###########################
### Websocket functions ###
###########################
async def register(websocket):
    try:
        USERS.add(websocket)
        logging.info("New user registered...")
        logging.info("Actual Users: " + str(len(USERS)))
        await notify_users()
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def unregister(websocket):
    try:
        USERS.remove(websocket)
        logging.info("User unregistered...")
        await notify_users()
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def notify_users():
    try:
        if USERS:       # asyncio.wait doesn't accept an empty list
            message = users_event()
            await asyncio.wait([user.send(message) for user in USERS])
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

def users_event():
    try:
        return json.dumps({'type': 'users', 'count': len(USERS)})
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def send_message(message):
    try:
        if USERS:       # asyncio.wait doesn't accept an empty list
            debug("Outgoing: " + message)
            logging.info("Outgoing: " + message)
            await asyncio.wait([user.send(message) for user in USERS])
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def ws_server(websocket, path):
    await register(websocket)
    if updateElapsedRunning == False:
        _thread.start_new_thread(updateElapsedThread, ())
    if checkSongChangedRunning == False:
        _thread.start_new_thread(SongChangedThread, ())
    try:
        async for message in websocket:
            if await check_json(message) == True:
                data_r = json.loads(message)
                logging.info("Incoming: " + str(message))
                if await dict_keycheck(data_r, "Action") == True:
                    ###############
                    ### General ###
                    ###############
                    
                    ### ConnTest
                    if data_r['Action'] == "ConnTest":
                        await ConnTest()
                    
                    ##############
                    ### Player ###
                    ##############
                    
                    ### getState
                    elif data_r['Action'] == "getState":
                        await sendState()
                    ### setVolume
                    elif data_r['Action'] == "setVolume":
                        if await dict_keycheck(data_r, "newVolume") == True:
                            await setVolume(data_r['newVolume'])
                    ### Play
                    elif data_r['Action'] == "Play":
                        await Play()
                    ### Pause
                    elif data_r['Action'] == "Pause":
                        if await dict_keycheck(data_r, "PauseStatus") == True:
                            await Pause(data_r['PauseStatus'])
                    ### Stop
                    elif data_r['Action'] == "Stop":
                        await Stop()
                    ### Next
                    elif data_r['Action'] == "Next":
                        await Next()
                    ### Previous
                    elif data_r['Action'] == "Previous":
                        await Previous()
                    ### setElapsed
                    elif data_r['Action'] == "setElapsed":
                        if await dict_keycheck(data_r, "newElapsed") == True:
                            newElapsed = True
                            await setElapsed(data_r['newElapsed'])
                    ### Random
                    elif data_r['Action'] == "Random":
                        if await dict_keycheck(data_r, "State") == True:
                            await Random(data_r['State'])
                    ### Repeat
                    elif data_r['Action'] == "Repeat":
                        if await dict_keycheck(data_r, "State") == True:
                            await Repeat(data_r['State'])
                    
                    #######################
                    ### User Management ###
                    #######################
                    
                    ### AddUser
                    elif data_r['Action'] == "AddUser":
                        if await dict_keycheck(data_r, "Name") == True and await dict_keycheck(data_r, "Color") == True:
                            await AddUser(data_r['Name'], data_r['Color'])
                    else:
                        logging.error("unsupported event: {}: " + message)
                    
                    #######################
                    ### Playlist-Editor ###
                    #######################
                else:
                    pass
            else:
                logging.error("No valid JSON String received: " + message)
    except websockets.exceptions.ConnectionClosed as wsex:
        debug("Websocket-internal Exception without reason; happens on Client disconnect: " + str(wsex))
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)
    finally:
        await unregister(websocket)
        logging.info("Remaining Users: " + str(len(USERS)))

############################
### Exception Prevention ###
############################
async def dict_keycheck(dict, key):
    try:
        dict[key]
        return True
    except KeyError as ke:
        debug("KeyError - Received Dict: " + str(dict) + " - Expected Key: " + str(ke))
        return False
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)
        return False

async def check_json(text):
    try:
        json.loads(text)
        return True
    except:
        return False

async def check_mpd():
    global client
    try:
        status = {}
        status = client.status()
    except Exception as e:
        debug("MPD-Bug: " + str(e) + " - despite disabled connection timout")
        debug("Try to reconnect")
        client.connect(mpd_host, mpd_port)

############################
### RaspiRadio functions ###
############################

### General
async def ConnTest():
    try:
        message = {"Action": "ConnTest","Response": "OK"}
        data_s = json.dumps(message)
        await send_message(data_s)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

### Player
async def sendState():
    global client
    try:
        # commented lines with print arent debug() messages because
        # there is a debug message for all sent messages in the
        # send_message() function.
        await check_mpd()
        status = {}
        status = client.status()
        #print("Status: " + str(status))
        
        randomstate = int(status['random'])
        #print("Randomstate: " + str(randomstate))
        
        repeatstate = int(status['repeat'])
        #print("Repeatstate: " + str(repeatstate))
        
        X = int(status['songid'])
        songinfo_list = client.playlistid(X)
        songinfo_string = ''.join(str(e) for e in songinfo_list)
        songinfo = ast.literal_eval(songinfo_string)
        #print("SongInfo: " + str(songinfo))
        
        state = status['state']
        #print("State: " + str(state))
        
        command = {"Action": "State", "Title": (songinfo['title']), "Artist": (songinfo['artist']), "Duration": (songinfo['time']), "Elapsed": (status['elapsed']),"Volume": (status['volume']),"State": state, "RandomState": (randomstate), "RepeatState": (repeatstate)}
        #print("Command: " + str(command))
        
        data_s = json.dumps(command)
        await send_message(data_s)
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def setVolume(newVolume):
    global client
    try:
        await check_mpd()
        client.setvol(int(newVolume))
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Play():
    global client
    try:
        await check_mpd()
        client.play(1)
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Pause(PauseStatus):
    global client
    try:
        await check_mpd()
        client.pause(int(PauseStatus))
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Stop():
    global client
    try:
        await check_mpd()
        client.stop()
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Next():
    global client
    try:
        await check_mpd()
        status = {}
        status = client.status()
        if await dict_keycheck(status, "nextsongid") == True:
            client.next()
        else:
            client.play(0)
            client.pause(1)
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Previous():
    global client
    try:
        await check_mpd()
        client.previous()
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def setElapsed(newElapsedTime):
    global newElapsed
    try:
        await check_mpd()
        #print(int(round(newElapsedTime)))
        client.seekcur(int(round(newElapsedTime)))
        message = {"Action": "setElapsed","Response": "OK"}
        data_s = json.dumps(message)
        await send_message(data_s)
        #time.sleep(1)
        newElapsed = False
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
        client.disconnect()
        client.close()
        client.open()
        client.connect(mpd_host, mpd_port)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Random(newstate):
    try:
        await check_mpd()
        client.random(int(newstate))
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

async def Repeat(newstate):
    try:
        await check_mpd()
        client.repeat(int(newstate))
    except MPDError as mpde:
        lineno = sys.exc_info()[-1].tb_lineno
        error("MPDError: " + str(mpde), lineno)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

### User Management
async def AddUser(username, color):
    # Only a placeholder for a future function - must be heavily updated
    # In the meantime this function only writes the received data to
    # a text file instead of writing in a mysql database
    try:
        data = username + "," + color + "\n"
        #print("JSON Adduser nach json_parse")
        path = '/home/pi/Python-Scripts/Userdatabase.txt'
        #users_file = open(path, 'r+')
        users_file = open(path, 'a')
        #print("JSON Adduser nach erstellung der  txt")
        users_file.write(data)
        users_file.close()
        #print("JSON Adduser")
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)

### Playlist Management

#######################
### Looping threads ###
#######################
def updateElapsedThread():
    loop = asyncio.new_event_loop()
    loop.run_until_complete(updateElapsed())
    loop.run_forever()

async def updateElapsed():
    try:
        global client
        global newElapsed
        global updateElapsedRunning
        updateElapsedRunning = True
        while 1:
            if newElapsed == False:
                await check_mpd()
                status = {}
                status = client.status()
                elapsed = status['elapsed']
                command = {"Action": "newElapsed","Value": elapsed}
                data_s = json.dumps(command)
                await send_message(data_s)
                #debug("updateElapsed: " + str(command))
                #print("update")
            #else:
                #print("übersprungen")
            time.sleep(1)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)
        updateElapsedRunning = False

def SongChangedThread():
    loop = asyncio.new_event_loop()
    loop.run_until_complete(checkSongChanged())
    loop.run_forever()

async def checkSongChanged():
    try:
        global client
        global checkSongChangedRunning
        checkSongChangedRunning = True
        oldsongid = 0
        while 1:
            await check_mpd()
            status = {}
            status = client.status()
            if await dict_keycheck(status, "songid") == True:
                if int(status["songid"]) != oldsongid:
                    await sendState()
                    oldsongid = int(status["songid"])
            time.sleep(1)
    except Exception as e:
        lineno = sys.exc_info()[-1].tb_lineno
        error(str(e), lineno)
        checkSongChangedRunning = False

############
### Main ###
############
logging.info("Server started...")
mpd_init()
asyncio.get_event_loop().run_until_complete(
    websockets.serve(ws_server, ws_host, ws_port)
)
asyncio.get_event_loop().run_forever()