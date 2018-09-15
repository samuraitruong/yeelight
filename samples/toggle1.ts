import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const yeelight = new Yeelight({ lightIp: "192.168.1.101", lightPort: 55443 }, logger);

yeelight.on("connected", () => {
    logger.info("connected, toggle the light");
    yeelight.toggle();
});
yeelight.connect();