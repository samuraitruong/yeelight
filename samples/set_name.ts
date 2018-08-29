import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeeligt } from "../src/yeelight";
import * as logger from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.setName("bed_room_bulb");
    });
    yeelight.connect();
});

discover.start();