import time
import RPi.GPIO as GPIO
import pika, config

blackPin, yellowPin = 6, 5
GPIO.setmode(GPIO.BCM)
GPIO.setup(blackPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setmode(GPIO.BCM)
GPIO.setup(yellowPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.add_event_detect(blackPin, GPIO.RISING, bouncetime=1000)
GPIO.add_event_detect(yellowPin, GPIO.RISING, bouncetime=1000)

connection = None

try:
    username = config.credentials["username"]
    mqPassword = config.credentials["password"]

    url = "amqp://" + username + ":" + mqPassword + "@elephant.rmq.cloudamqp.com/" + username
    connection = pika.BlockingConnection(pika.URLParameters(url))
    channel = connection.channel()
    channel.exchange_declare(exchange="goalScored", exchange_type="fanout")   
except:
    print "Error: unable to esablish a connection"

try:
    while connection is not None:
        if GPIO.event_detected(yellowPin):
            channel.basic_publish(exchange='goalScored', routing_key='', body='2')
            # print ("[x] Sent '2: Yellow Scored!")
        elif GPIO.event_detected(blackPin):
            channel.basic_publish(exchange='goalScored', routing_key='', body='1')
            # print ("[x] Sent '1: Black Scored!")
        time.sleep(1)
except:
    connection.close()