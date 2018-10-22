# YEELIGHT AWESOME - NODEJS
The node api to control yeelight devices using wifi network TCP/UDP

[![Build Status](https://travis-ci.org/samuraitruong/yeelight.svg?branch=develop)](https://travis-ci.org/samuraitruong/yeelight) [![Codecov branch](https://img.shields.io/codecov/c/github/samuraitruong/yeelight/develop.svg?style=popout)](https://codecov.io/gh/samuraitruong/yeelight/branch/develop)
[![Package Quality](http://npm.packagequality.com/badge/yeelight-awesome.png)](http://packagequality.com/#?package=yeelight-awesome)
[Mocha Test Report](https://samuraitruong.github.io/yeelight/mochawesome-report/mochawesome.html)

[Test Coverage Report](https://samuraitruong.github.io/yeelight/coverage/)


## Installation
```bash 

npm install yeelight-awesome

```

## Get Started
### Setup your light
You need to enable "LAN Control" on the phone App make the light discoverable over LAN network. Open the phone app, go to the light setting and toggle LAN control on.

Reset your device
Use physical switch to turn on - off the light 5 time, give the 1 second break in the between of the onn/off. You probably need to do reset device and reset up it with phone app if the discover doesn't work properly.

### Discover the light
Before you can control the light, you need to discover it unless you know the light's IP
```js
    // typescript
    import { Discover ,IDevice } from "yeelight-awesome";
    const discover = new Discover({ port: 1982,  debug: true }, logger);
    discover.once("deviceAdded", (device: IDevice) => {
        // using device action
    });
    // make sure you call this
    discover.start();

```

```js
    // javascript
    const y = require("yeelight-awesome");
    const discover = new y.Discover({
        port: 1982,
        debug: true
    });
    discover.once("deviceAdded", (device) => {
        const yeelight = new y.Yeelight({
            lightIp: device.host,
            lightPort: device.port
        });

        yeelight.on("connected", () => {
            yeelight.setRGB(new y.Color(123, 99, 65), "smooth", 5000);
        });
        yeelight.connect();
    });

    discover.start();

```

There is know issue with the yeelight device that discover method doesn't work at the first time attemp. In this case we can:
- reset device and resetup -see instruction above
- make the connection using the light IP without discover method, after the first connection successful. the light now will response to discover method
- from version 1.0.6, there is fallback option to using Ip scan if discover failed. this fallback option is turn on by default. 
  ```js
    const discover = new Discover({fallback: true});

    discover.start();
  ```

- Use IP scan method (this method will expect to take few seconds)
  ```js
    const discover = new Discover({});

    discover.scanByIp().then(devices => console.log("scan finished: ", devices));

    discover.on("deviceAdded", (device: IDevice) => {
      console.log("found device", device);
    });
  ```
### Control the light
To control the light, you need to know the IP of the light, if not sure, using the discover above to find details, after you have details you can make connection to the light and control it

```js
    import { Yeelight, Color } from "yeelight-awesome";

    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setRGB(new Color(66, 87, 23), "smooth", 5000);
    });
    yeelight.connect();
```

### Handle Events
The yeelight awesome using Event Emitter pattern, so that you can hook up into the event to get & process data. bellow are list of event
- commandSuccess: This event emit on every command successful
- set_power
- toggle
- set_default
- start_cf
- stop_cf
- get_prop
- set_scene
- set_ct_abx
- set_rgb
- set_hsv
- set_bright
- cron_add
- cron_get
- cron_del
- set_adjust
- set_music
- set_name
- adjust_bright
- adjust_ct
- adjust_color

event data. each event will emit with below data
```js
interface IEventResult {
    action: CommandType;
    command: Command;
    result: ICommandResult;
    success: boolean;
}
```
### Use Promise 
see below example
```js
    const discover = new Discover({ debug: true }, logger);
    discover.start().then((devices) => {
        const device = devices[0];
        logger.info("found device: ", devices);
        const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

        yeelight.connect().then((l) => {
            l.toggle().then(() => {
                logger.info("The light has been toggled");
                // you need to call disconnect and destroy when you finish
                l.disconnect();
                discover.destroy();
            });
        });

    }).catch((e) => {
        logger.error(e);
        discover.destroy();
    });
```
All the method has promise support.
example: 
```js
    // yeelight will always running on port 55443
    const yeelight = new Yeelight({ lightIp: "192.168.1.101", lightPort: 55443 });
    yeelight.once(CommandType.SET_NAME, (data) => {
        logger.info("Can also capture the event data when it ran successful", data);
    });

    yeelight.once("commandSuccess", (data) => {
        logger.info("commandSuccesss fire everytime the command finish", data);
    });
    yeelight.connect().then(function(light) {
        light.setName("Bedroom1_light")
    })
```
### Logger
You can pass any logger in the constructor of Discover/Yeelight class. In our example we use winston library to write a log.

to write your own logger, you need implement the logger with below ILogger interface
```js
    interface ILogger {
        info: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
        debug: (message: string, data?: any) => void;
        log?: (message: string, data?: any) => void;
    }
```

If logger not being passed to the constructor, the console.log will be used. by using default Logger below
```js
    const defaultLogger: ILogger = {
        debug: (message: string, obj: any) => console.debug,
        error: (message: string, obj: any) => console.error,
        info: (message: string, obj: any) => console.info,
        log: (message: string, obj: any) => console.log,
    };

```

# Samples
Here are a full sample of set color flow

```js
    // Typescript
    import { Discover, IDevice,StartFlowAction , FlowState, Yeelight, logger } from "yeelight-awesome";

    const discover = new Discover({ port: 1982, asPromise: true, debug: true }, logger);
    discover.once("deviceAdded", (device: IDevice) => {
        logger.info("found device: ", device);
        const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

        yeelight.on("connected", () => {
            yeelight.startColorFlow([
                new FlowState(2000, 2, 2700, 100),
                new FlowState(2000, 1, 255, 50),
                new FlowState(2000, 7, 1500, 30),
                new FlowState(2000, 2, 5000, 45),
                new FlowState(2000, 2, 3000, 25),
            ], StartFlowAction.LED_STAY);
        });
        yeelight.connect();
    });

    discover.start();

```
Or javascript
```js
    const discover = new Discover({ debug: true }, logger);
    discover.start().then((devices) => {
        const device = devices[0];
        logger.info("found device: ", devices);
        const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port }, logger);

        yeelight.connect().then((l) => {
            l.startColorFlow([
                new FlowState(2000, 2, 2700, 100),
                new FlowState(2000, 1, 255, 50),
                new FlowState(2000, 7, 1500, 30),
                new FlowState(2000, 2, 5000, 45),
                new FlowState(2000, 2, 3000, 25),
            ]).then(() => {
                logger.info("Start color flow finish");
                // you need to call disconnect and destroy when you finish
                l.disconnect();
                discover.destroy();
            });
        });

    }).catch((e) => {
        logger.error(e);
        discover.destroy();
    });
```

Please refer to [https://github.com/samuraitruong/yeelight/tree/master/samples] (https://github.com/samuraitruong/yeelight/tree/master/samples)

NOTE: The example was written in typescript so you need to use ts-node to run them. 
```bash
ts-node samples/filename.ts
```
# API
Yeelight awesome has implement all the support function for yeelight device, Just in case the device has new function that not covert by the API, you can use the sendCommands function with your own data structure to make a request to the light

Please refer to [https://samuraitruong.github.io/yeelight/] (https://samuraitruong.github.io/yeelight/) for all details document

* NOTE: This library has been test and confirm working on Yeelight YLDP02YL AC220V RGBW E27 Smart LED Bulb 
To run the example, you need to install ts-node

``` bash
npm install ts-node -g
then execute the ts-ndoe instead of node with the typescript file

ts-node sample/start-flow.ts
```

# WIP
- Adding error handling event/successful event
- Enhancement documents and add defined type for typescript
- Unit test & Test Coverage for the main code

# Issues & Feedbacks
Please use github issue page if you encounter with any problem or want to give a feedback, feel free to post an issue on github page

# Bug fixs & Enhancements
Feel free to fork and pull request the new feature that you make/or bug you fix. Thanks

# Release Notes
- 1.0.10 : Added typescript declaration 
- 1.0.8 : Fix the repeat count of startColorFlow function (start_cf)
- 1.0.7 : Added  set_shv function
- 1.0.6 : added support IP scan method fallback
- 1.0.3: Added support promises
- 1.0.0-1.0.0.2 : The very first initial , include all test and working function