import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    discover.destroy();
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("set_name", () => {
        yeelight.disconnect();
    })
    yeelight.on("connected", () => {
        yeelight.setName("bed_room_bulb");
    });
    yeelight.connect();
});

discover.start();