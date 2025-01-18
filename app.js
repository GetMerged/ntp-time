import { NTPClient } from "./ntpClient.js";

async function testNTPTime() {
    try {
        // Create NTP client instance
        const ntpClient = new NTPClient();
        
        // Get system time
        const systemTime = new Date();
        const systemLocalTime = systemTime.toLocaleString();
        
        // Get NTP time
        console.log('Fetching NTP time...');
        const ntpTime = await ntpClient.getNetworkTime();
        const ntpLocalTime = ntpTime.toLocaleString();
        
        // Compare times
        console.log('System Time:', systemLocalTime);
        console.log('NTP Time:', ntpLocalTime);
        
        // Calculate difference in seconds
        const diffInSeconds = Math.abs((ntpTime.getTime() - systemTime.getTime()) / 1000);
        console.log(`Time difference: ${diffInSeconds.toFixed(3)} seconds`);
        
    } catch (error) {
        console.error('Error fetching NTP time:', error.message);
    }
}

// Run the test
testNTPTime();