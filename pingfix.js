const fs = require('fs');
const axios = require('axios');

// Read device IDs from file
const getDeviceIds = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('device_ids.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        reject(err);
      } else {
        const ids = data.split('\n').map(id => id.trim()).filter(id => id.length > 0);
        console.log('Device IDs read from file:', ids);
        resolve(ids);
      }
    });
  });
};

// Function to perform GET request
const pingDevice = async (deviceId) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://be.rivalz.ai/api-v2/node/ping/${deviceId}/2.4.0/CLI`,
    headers: {}
  };

  try {
    const response = await axios.request(config);
    console.log(`Pinging Device ID ${deviceId} ✅🛠️ SUCCESS`);
    // console.log(`Response for ${deviceId}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(`Error for ${deviceId}:`, error.message);
  }
};

// Function to display a loading animation with a real-time countdown
const showLoadingAnimation = (delay) => {
  let secondsRemaining = delay / 1000;
  const interval = setInterval(() => {
    process.stdout.write(`\rWaiting for ${secondsRemaining} seconds...`);
    secondsRemaining--;
    if (secondsRemaining < 0) {
      clearInterval(interval);
      process.stdout.write('\n');
    }
  }, 1000);
};

// Function to ping all devices with 3 seconds delay between batches of 50
const pingDevicesWithDelay = async () => {
  try {
    const deviceIds = await getDeviceIds();

    if (deviceIds.length === 0) {
      console.log('No device IDs found in file.');
      return;
    }

    const delay = 3000; // 3 seconds in milliseconds
    let index = 0;
    const pingNextBatch = async () => {
      if (index >= deviceIds.length) {
        console.log('All device IDs have been processed.');
        return; // Exit if all device IDs have been processed
      }

      const batch = deviceIds.slice(index, index + 50);
      const promises = batch.map(async (deviceId, count) => {
        console.log(`Pinging Device [${index + count + 1}] ID: ${deviceId}`);
        await pingDevice(deviceId);
      });

      await Promise.all(promises);

      index += 50;
      if (index < deviceIds.length) {
        setTimeout(pingNextBatch, delay);
      } else {
        console.log('All batches have been processed.');
        const delayMs = 300000; // 5 minutes delay in milliseconds
        showLoadingAnimation(delayMs);
        setTimeout(pingDevicesWithDelay, delayMs);
      }
    };

    pingNextBatch(); // Start the process

  } catch (error) {
    console.error('Error during initialization:', error);
  }
};

// Start the process
pingDevicesWithDelay();
