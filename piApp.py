from flask import Flask, render_template, request, jsonify
import time, json, jinja2
from threading import Thread
import RPi.GPIO as GPIO
import os, random
import pika, config
        
app = Flask(__name__)

blackPin, yellowPin = 6, 5
GPIO.setmode(GPIO.BCM)
GPIO.setup(blackPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setmode(GPIO.BCM)
GPIO.setup(yellowPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.add_event_detect(blackPin, GPIO.RISING, bouncetime=1000)
GPIO.add_event_detect(yellowPin, GPIO.RISING, bouncetime=1000)
blackScored = False
yellowScored = False
thread = Thread()

username = config.credentials["username"]
mqPassword = config.credentials["password"]

url = "amqp://" + username + ":" + mqPassword + "@elephant.rmq.cloudamqp.com/" + username
connection = pika.BlockingConnection(pika.URLParameters(url))
channel = connection.channel()
channel.exchange_declare(exchange="goalScored", exchange_type="fanout")


def bakePie():
    while True:
        global queue_name
        global channel
        global yellowScored
        global blackScored
        yellowScored = False
        blackScored = False
        if GPIO.event_detected(yellowPin):
            print "yellow goal!"
            yellowScored = True
            channel.basic_publish(exchange='goalScored', routing_key='', body='2')
            print ("[x] Sent '2: Yellow Scored!")
        elif GPIO.event_detected(blackPin):
            print "black goal"
            blackScored = True
            channel.basic_publish(exchange='goalScored', routing_key='', body='1')
            print ("[x] Sent '1: Black Scored!")
        time.sleep(1)

# Returns a string representing the game data to be sent to JSON
def formatGameData(index, gameData):
    gameData = json.loads(gameData)
    gameData = {'_id': index,
                'bName': gameData['bName'],
                'yName': gameData['yName'],
                'bScore': gameData['bScore'],
                'yScore': gameData['yScore']}
    return json.dumps(gameData)
            
@app.route('/', methods=["GET", "POST"])
def intro():
    print "hello"
    return render_template('index.html')

@app.route('/game', methods=['POST'])
def quickGame():
    global thread
    global finished
    thread = Thread(target=bakePie)
    thread.start()
    result = request.form
    return render_template('game.html', result=result, yellowScored=0, blackScored=0)

@app.route('/endgame', methods=['GET'])
def endGame():
    with open('games.json') as f: 
        data = json.load(f)
    newInd = len(data)
    gameData = request.args.get("gameData")
    formatted = formatGameData(newInd, gameData)
    gameJson = json.loads(formatted)
    data.append(gameJson)

    with open('games.json', 'w') as f:
        json.dump(data, f)

    return render_template('game.html', result=None, yellowScored=int(gameJson['yScore']), blackScored=int(gameJson['bScore']))

@app.route('/status')
def threadStatus():
    status = jsonify({"yellowScored": yellowScored, "blackScored": blackScored})
    return status

if __name__ == "__main__":
    global connection
    app.run(host="0.0.0.0", debug=True)
    print "closing connection"
    connection.close()

