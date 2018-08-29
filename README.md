# yeelight
The node api to control yeelight devices using wifi network TCP/UDP
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
Please refer to [https://github.com/samuraitruong/yeelight/tree/master/samples] (https://github.com/samuraitruong/yeelight/tree/master/samples)

# API