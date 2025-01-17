import * as dgram from 'node:dgram';



const TEN_SECONDS_IN_MILLIS = 10_000;



const defaultConfig = {
  port: 123,
  replyTimeout: TEN_SECONDS_IN_MILLIS,
  server: 'pool.ntp.org'
};
class NTPClient {
  constructor(configOrServer, port, replyTimeout) {
    this.config = defaultConfig;
    if (typeof configOrServer === 'string') {
      this.config.server = configOrServer;
    } else if (configOrServer) {
      this.config = {
        ...this.config,
        ...configOrServer
      };
    }
    if (port) {
      this.config.port = port;
    }
    
    if (replyTimeout) {
      this.config.replyTimeout = replyTimeout;
    }
  }
}

export { NTPClient }
