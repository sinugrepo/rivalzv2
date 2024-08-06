const fs = require('fs');
const axios = require('axios');
const mqtt = require('mqtt');

const serverUrl = 'https://be.rivalz.ai';
const mqttBrokerUrl = 'mqtt://158.247.249.51:1883';

// Fungsi untuk membaca ID perangkat dari file
function readDeviceIds(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            const ids = data.split('\n').map(id => id.trim()).filter(id => id.length > 0);
            resolve(ids);
        });
    });
}

// Fungsi untuk memulai koneksi dan melaporkan status
async function startClients() {
    try {
        const clientIds = await readDeviceIds('device_ids.txt');
        clientIds.forEach(clientId => {
            const client = mqtt.connect(mqttBrokerUrl, {
                clientId: clientId,
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 1000
            });

            client.on('connect', () => {
                console.log(`Client ${clientId} connected to MQTT broker`);
                reportStatus(clientId);
            });

            client.on('error', (err) => {
                console.error(`Client ${clientId} connection error:`, err);
            });

            client.on('close', () => {
                console.log(`Client ${clientId} disconnected from MQTT broker`);
            });
        });
    } catch (error) {
        console.error('Error reading device IDs:', error);
    }
}

// Fungsi untuk melaporkan status ke server
async function reportStatus(clientId) {
    try {
        const response = await axios.get(`${serverUrl}/api-v2/ipfs-v2/check-connectivity/${clientId}`);
        console.log(`Client ${clientId} status:`, response.data);

        if (response.data.status === 200) {
            console.log(`Client ${clientId} reported status successfully`);
        } else {
            console.log(`Client ${clientId} failed to report status`);
        }
    } catch (error) {
        console.error(`Client ${clientId} error reporting status:`, error);
    }
}

// Memulai klien
startClients();

// Set interval untuk melaporkan status setiap 5 menit
setInterval(async () => {
    try {
        const clientIds = await readDeviceIds('device_ids.txt');
        clientIds.forEach(clientId => reportStatus(clientId));
    } catch (error) {
        console.error('Error reading device IDs for interval report:', error);
    }
}, 5 * 60 * 1000);
