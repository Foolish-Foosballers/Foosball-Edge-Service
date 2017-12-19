from flask import Flask, render_template, request, jsonify
import time, json, jinja2
from threading import Thread
import os, random
import pika, config
        
app = Flask(__name__)

blackPin, yellowPin = 6, 5
blackScored = False
yellowScored = False
thread = Thread()

username = config.credentials["username"]
mqPassword = config.credentials["password"]

url = "amqp://" + username + ":" + mqPassword + "@elephant.rmq.cloudamqp.com/" + username
connection = pika.BlockingConnection(pika.URLParameters(url))
channel = connection.channel()
# channel.queue_declare(queue=queue_name)
channel.exchange_declare(exchange="goalScored", exchange_type="fanout")

def bakePie():
    while True:
        global yellowScored
        global blackScored
        global queue_name
        global channel
        yellowScored = False
        blackScored = False
        result = random.random()  
        if result < 0.5:
            blackScored = True
            # channel.basic_publish(exchange='', routing_key=queue_name, body='Black Scored!')
            channel.basic_publish(exchange='goalScored', routing_key='', body='Black Scored!')
            print ("[x] Sent 'Black Scored!")
            time.sleep(1)
        else:
            yellowScored = True
            # channel.basic_publish(exchange='', routing_key=queue_name, body='Yellow Scored!')
            channel.basic_publish(exchange='goalScored', routing_key='', body='Yellow Scored!')
            print ("[x] Sent 'Yellow Scored!")
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
    app.run(host="127.0.0.1", debug=True)
    print "closing connection"
    connection.close()

