# Reading Sensors with Agents

This is a demo of exposing environmental sensors to agents. It's designed to run on an Arduino Uno Q because it's a single board computer and has easy extensibility with the Qwiic connector.

## Hardware requirements

* [Arduino Uno Q](https://docs.arduino.cc/hardware/uno-q/)
* [Modulino Thermo](https://docs.arduino.cc/hardware/modulino-thermo/)
* [Modulino Light](https://docs.arduino.cc/hardware/modulino-light/)
* Network connection (Wifi or hardwired through USB-C adapter)
* Optional keyboard, monitor, hardwired network

I used WiFi and a [USB-C adapter](https://www.amazon.com/dp/B0D1XLNWP2) that has HDMI and USB ports for initial setup. Afterwards I accessed via SSH.

## Software Requirements

* node (I used [nvm](https://github.com/nvm-sh/nvm) and installed the latest version)
* 

## Setup on Arduino Uno Q

**Hardware**

1. Connect the Thermo and Light modulinos on the Qwiic conector in a daisy chain. 

**Basic Software Setup**
This assumes you have already booted and done the initial setup of your Uno Q.

1. `ssh keygen -A` for ssh access to work
1. Note the IP address for SSH on another machine


**Get the code in the right place**
1. Getting the code
   1. **Either** scp the files to ~/ArduinoApps folder
   1. **Or** SSH in, go to ~/ArduinoApps folder, git clone this repo
1. `cd agentic-sensors`
1. `arduino-app-cli app start .`

This should download all the Arduino dependencies, compile the app, and deploy it on the SoC and MCU. Now the app should be running on the MCU. For this demo, we don't care about the Python part of the app. Next we will set up and run the typescript app.

##Set up and run typescript##

1. Get an API key from https://aistudio.google.com/api-keys
1. `echo "GOOGLE_GENAI_USE_VERTEXAI=FALSE" >> .env`
1. `echo "GEMINI_API_KEY=PASTE_YOUR_ACTUAL_API_KEY_HERE" >> .env`

1. `cd typescript`
1. `npm install` _this may take a while_
1. `npx adk run agent.ts`

This will start the command line so you can interact with the agent.

## Interacting with your agent

This is a normal agent that can do anything you'd like, but the superpower is access to a tool that reads the attached Modulino sensors by calling the MCU.

Example interaction:

```
[user]: hello
[sensor_reader]: Hello! I'm your sensor reader agent. I can provide you with the current temperature, humidity, and light levels from your environment sensors. I'll present the information in a tidy table and even throw in a random fact related to the readings. How can I help you today?
[user]: what's the temperature like today?
[sensor_reader]: Here's what the sensors are reporting today:

| Sensor      | Value    |
|-------------|----------|
| Temperature | 21.62 °C |
| Humidity    | 59.61 %  |
| Light Level | 435 lux  |

**Random Fact:** A comfortable indoor temperature for most people is typically between 20°C and 22°C, so your environment is quite pleasant!
```

## Notes

I tried to use the standard arduino-cli to program the mcu but was unsuccessful. I just decided to use the Arduino app lab ecosystem and a python script that does nothing. I'm not sure if it's even required but this is the easiest way to program the MCU.