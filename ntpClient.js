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

  /** Fetches the current NTP Time from the given server and port. */
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
      ntpData[0] = 0x1b;

      const timeout = setTimeout(() => {
        client.close();
        reject(new Error('Timeout waiting for NTP response.'));
        errorFired = true;
      }, this.config.replyTimeout);

      /*
       May be you will face issue, need to add error handling 
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

      client.send(ntpData, 0, ntpData.length, this.config.port, this.config.server, err => {
        if (err) {
          if (errorFired) {
            return;
          }
          clearTimeout(timeout);
          errorFired = true;
          client.close();
          return reject(err);
        }

        client.once('message', msg => {
          clearTimeout(timeout);
          client.close();

          // timstamp
          // timestamp format, 64-bit
          const offsetTransmitTime = 40;
          let intpart = 0;
          let fractpart = 0;

          /* Purpose: Extract the integer part of the transmit timestamp.
               How:
                   The NTP transmit timestamp is an 8-byte value:
                   The first 4 bytes represent the integer part (seconds since January 1, 1900).
                   The next 4 bytes represent the fractional part (fraction of a second).
                     msg[offsetTransmitTime + index] accesses each byte of the integer part.
                   256 * intpart shifts the current value left by 8 bits (1 byte).
                     + msg[offsetTransmitTime + index] adds the next byte to build the integer value. 

        */
          for (let index = 0; index <= 3; index++) {
            intpart = 256 * intpart + msg[offsetTransmitTime + index];
          }

          // The code iterates over the next 4 bytes (indices 4–7) of the 8-byte transmit timestamp.
          // Each byte is similarly added to fractpart, representing fractions of a second.

          for (let index = 4; index <= 7; index++) {
            fractpart = 256 * fractpart + msg[offsetTransmitTime + index];
          }

          /*  intpart * 1000: Converts the integer part (seconds) into milliseconds.
               (fractpart * 1000) / 0x100_000_000: Converts the fractional part into milliseconds:
              The fractional part represents a fraction of a second.
            Dividing by 0x100_000_000 (which is 2^32) converts it to the fraction of a second, as the fractional part is stored in fixed-point 32-bit precision.
              */

          const milliseconds = intpart * 1000 + (fractpart * 1000) / 0x100_000_000;

          // UTC time
          const date = new Date('Jan 01 1900 GMT');
          date.setUTCMilliseconds(date.getUTCMilliseconds() + milliseconds);
          return resolve(date);
        });
      });
    });
  }
}

export { NTPClient };