#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

ModulinoThermo thermo;
ModulinoLight light;

struct SensorData {
  float temperature;
  float humidity;
  int lux;
  MSGPACK_DEFINE(temperature, humidity, lux);
};

void setup() {
  Monitor.begin();
  Monitor.println("Sensor reader starting");

  Monitor.println("Initializing sensors");
  Modulino.begin();
  thermo.begin();
  light.begin();
  
  Monitor.println("Initializing bridge");
  Bridge.begin();
  Bridge.provide("read_sensors", read_sensors);

  Monitor.println("Init done.");
}

void loop() {
  //k_msleep(10);
}

SensorData read_sensors() {
  Monitor.println("read_sensors called");
  SensorData data;

  Monitor.println("Reading temperature");
  data.temperature = thermo.getTemperature();
  Monitor.println("Reading humidity");
  data.humidity = thermo.getHumidity();
  Monitor.println("Updating light");
  light.update();
  Monitor.println("Reading lux");
  data.lux = light.getAL();

  return data;
}

