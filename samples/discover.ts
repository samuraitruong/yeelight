import { Discover } from "../src/discover";
import * as logger from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (aa) => {
    console.log(aa);
});

discover.start();