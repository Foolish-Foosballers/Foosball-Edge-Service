# Foosball-Edge-Service
Microservice responsible for handling input sensor data from Raspberry Pi and sending messages to established message queue.

## Breakbeam Sensors 
Two breakbream sensors are connected to the Pi and recognize when an event occurs. An event in our case is defined as a ball rolling past the sensor, which occurs when a goal is scored. Sensors are assigned to the left or right side of the foosball table. 

## Message Queue
The pika library is used to create and establish a connection to a message queue. Message queue is hosted on a free CloudAMQP instance. A message is sent to the queue when a goal is scored. 

