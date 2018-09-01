import { Discover } from "../../src/discover";
import { CommandType, IDevice, IEventResult } from "../../src/models";
import { Yeeligt } from "../../src/yeelight";
import { logger } from "../logger";

const discover = new Discover({ debug: true }, logger);
discover.start().then((devices: IDevice[]) => {
    const device = devices[0];
    logger.info("found device: ", devices);
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });
    yeelight.once(CommandType.TOGGLE, (data: IEventResult) => {
        console.log("can also capture the event data when it ran successful", data);
    })
    yeelight.connect().then((l) => {
        l.toggle().then(() => {
            logger.info("The light has been toggled");
            l.disconnect();
        });
    });

}).catch((e) => {
    logger.error(e);
    discover.destroy();
});
