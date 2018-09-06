import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { ILogger } from "../src/models/logger";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({});

discover.scanByIp(100, 110).then(x => console.log("scan finished: ", x));

discover.on("deviceAdded", (device: IDevice) => {
    console.log("found device", device);
});