import * as dgram from 'node:dgram';



const TEN_SECONDS_IN_MILLIS = 10_000;



const defaultConfig = {
  port: 123,
  replyTimeout: TEN_SECONDS_IN_MILLIS,
  server: 'time.nist.gov'
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

getNetworkTime(ntpReplyTimeout) {
  if (ntpReplyTimeout) {
    this.config.replyTimeout = ntpReplyTimeout;
  }

  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const ntpData = Buffer.alloc(48);

    // RFC 2030 -> LI = 0 (no warning, 2 bits), VN = 3 (IPv4 only, 3 bits), Mode = 3 (Client Mode, 3 bits) -> 1 byte
    // -> rtol(LI, 6) ^ rotl(VN, 3) ^ rotl(Mode, 0)
    // -> = 0x00 ^ 0x18 ^ 0x03

    // This is some complicated math operation, LI VN Mode, three component ntp
    ntpData[0] = 0x1b;

    const timeout = setTimeout(() => {
      client.close();
      reject(new Error('Timeout waiting for NTP response.'));
      errorFired = true;
    }, this.config.replyTimeout);

    /*
     Error may happen
     */
    let errorFired = false;

    client.on('error', err => {
      if (errorFired) {
        return;
      }
      errorFired = true;
      clearTimeout(timeout);
      return reject(err);
    });
  }
}

 



export { NTPClient }
