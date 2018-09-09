const fs = require("fs-extra");

const task1 = fs.copy("./coverage", "./doc/coverage");
const task2 = fs.copy("./.nyc_output", "./doc/nyc_output");

const task3 = fs.copy("./mochawesome-report", "./doc/mochawesome-report");

Promise.all([task1, task2, task3]).then((result) => {
    //console.log(result);
    console.log("copy output file to doc folder")
    process.exit(0)
}).catch(err => console.log(err))