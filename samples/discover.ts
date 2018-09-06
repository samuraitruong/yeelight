import { Discover } from "../src/discover";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (aa) => {
    console.log(aa);
});

discover.start();