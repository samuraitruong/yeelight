# yeelight
The node api to control yeelight devices using wifi network TCP/UDP

[![Build Status](https://travis-ci.org/samuraitruong/yeelight.svg?branch=develop)](https://travis-ci.org/samuraitruong/yeelight)
# Installation
```bash 

npm install yeelight-awesome

```

# Get Started
## Discover the light
Before you can control the light, you need to discover it unless you know the light's IP
```js
    // ES6, typescript
    import { Discover ,IDevice } from "yeelight-awesome";
    const discover = new Discover({ port: 1982, host: "",  debug: true }, logger);
    discover.once("deviceAdded", (device: IDevice) => {
        // using device action
    });
    // make sure you call this
    discover.start();

```
## Control the light
To control the light, you need to know the IP of the light, if not sure, using the discover above to find details, after you have details you can make connection to the light and control it

```js
    import { Yeelight, Color } from "yeelight-awesome";

    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setRGB(new Color(66, 87, 23), "smooth", 5000);
    });
    yeelight.connect();

```

# Samples
Here are a full sample of set color flow

```js
    import { Discover, IDevice,StartFlowAction , FlowState, Yeeligt, logger } from "yeelight-awesome";

    const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
    discover.once("deviceAdded", (device: IDevice) => {
        logger.info("found device: ", device);
        const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

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

Please refer to [https://github.com/samuraitruong/yeelight/tree/master/samples] (https://github.com/samuraitruong/yeelight/tree/master/samples)

# API
