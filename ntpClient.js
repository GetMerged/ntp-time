import * as dgram from "node:dgram"

// 10 millisecons os for checking synchronization
const TEN_MILIS = 10_000;


const defaultConfig = {
    port: 123,
    replyTimeout: TEN_MILIS,
    server: 'time.nist.gov'
};

class NTPClient {
    constructor(configServer,port,replyTimeout){
        this.config = defaultConfig

        if (typeof configServer == "string"){
            this.config.server = configServer
        }else if(configServer){
            this.config = {
                ...this.config,
                configServer
            }


        }

        if(port){
            this.config.port = port;
        }

        if(replyTimeout){
            this.config.replyTimeout = replyTimeout
        }
}
}

export {NTPClient}