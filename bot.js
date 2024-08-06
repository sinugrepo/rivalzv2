const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
const readline = require('readline');

// Function to generate random alphanumeric string
const generateRandomString = (length, prefix = '') => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(crypto.randomInt(chars.length));
  }
  return result;
};


// Generate random deviceId
const generateDeviceId = () => {
  return generateRandomString(64);
};


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}


// Generate random peerID with prefix
const generatePeerID = () => {
  return `12D3KooW${generateRandomString(32)}`;
};

// Path to the file where deviceIds will be stored
const deviceIdFilePath = 'device_ids.txt';

// Function to append deviceId to the file
const appendDeviceIdToFile = (deviceId) => {
  fs.appendFile(deviceIdFilePath, deviceId + '\n', (err) => {
    if (err) {
      console.error('Error appending deviceId to file:', err);
    } else {
      console.log('deviceId appended to file:', deviceId);
    }
  });
};

// Function to generate and send data
const generateAndSendData = (walletAddress) => {
  // Generate random values
  const ramOptions = [32, 48, 64];
  const cpuCoreOptions = [16, 24, 32];

  
  let ramUsage = ramOptions[Math.floor(Math.random() * ramOptions.length)];
  let totalCpuCore = cpuCoreOptions[Math.floor(Math.random() * cpuCoreOptions.length)];
  let cpuUsage = totalCpuCore;
  let cpuGhz = getRandomFloat(4.2, 4.5, 1);
  let cpuGhzMax = cpuGhz;
  let totalRamSize = ramUsage;
  let internetSpeed = getRandomFloat(53523460, 93415545, 9);


  const deviceId = generateDeviceId();
  const peerID = generatePeerID();

  // Append the new deviceId to the file
  appendDeviceIdToFile(deviceId);

  console.log('Generated deviceId:', deviceId);
  console.log('Generated peerID:', peerID);

  // Sample data object with random values
  const data = JSON.stringify({
    "walletAddress": walletAddress,
    "deviceId": deviceId,
    "storageUsage": 3000,
    "cpuGhz": cpuGhz,
    "cpuGhzMax": cpuGhzMax,
    "type": "rNode",
    "totalRamSize": totalRamSize,
    "ramMhz": 3200,
    "internetSpeed": internetSpeed,
    "storageType": "NVMe",
    "totalCpuCore": cpuUsage,
    "teraFlops": 1
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://be.rivalz.ai/api-v2/node',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'axios/1.7.2'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

// Function to process multiple devices
const processDevices = (numDevices, walletAddress) => {
  for (let i = 0; i < numDevices; i++) {
    generateAndSendData(walletAddress);
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for number of devices and wallet address
rl.question('Enter the number of devices: ', (numDevicesInput) => {
  const numDevices = parseInt(numDevicesInput, 10);

  if (isNaN(numDevices) || numDevices <= 0) {
    console.error('Please provide a valid number of devices.');
    rl.close();
    return;
  }

  rl.question('Enter the wallet address: ', (walletAddress) => {
    processDevices(numDevices, walletAddress);
    rl.close();
  });
});
