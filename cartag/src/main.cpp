/**
 * CarTag ESP32 BLE Firmware
 * 
 * This firmware creates a BLE peripheral that can communicate
 * with the CarSalut React Native app.
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Define UUIDs for the BLE service and characteristics
// You can generate your own UUIDs at https://www.uuidgenerator.net/
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Battery simulation variables
int batteryLevel = 100;
int updateCount = 0;
unsigned long lastUpdateTime = 0;
const unsigned long UPDATE_INTERVAL = 2000;  // 2 seconds

// Callback class to handle connection events
class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer, esp_ble_gatts_cb_param_t *param) {
        deviceConnected = true;
        Serial.println("Device connected");
        
        // Update connection parameters for stability
        // min interval, max interval, latency, timeout (in units of 1.25ms, 1.25ms, intervals, 10ms)
        pServer->updateConnParams(param->connect.remote_bda, 24, 48, 0, 400);
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("Device disconnected");
    }
};

// Callback class to handle characteristic write events
class MyCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        
        if (value.length() > 0) {
            Serial.print("Received value: ");
            for (int i = 0; i < value.length(); i++) {
                Serial.print(value[i]);
            }
            Serial.println();
            
            // Handle incoming commands here
            // Example: parse JSON or specific command strings
        }
    }
};

void setup() {
    Serial.begin(115200);
    Serial.println("Starting CarTag BLE...");

    // Initialize BLE
    BLEDevice::init("CarTag");
    
    // Create the BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create the BLE Service
    BLEService* pService = pServer->createService(SERVICE_UUID);

    // Create the BLE Characteristic
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ   |
        BLECharacteristic::PROPERTY_WRITE  |
        BLECharacteristic::PROPERTY_NOTIFY
    );

    // Add descriptor for notifications - this is required for clients to enable notifications
    BLE2902* pDescriptor = new BLE2902();
    pDescriptor->setNotifications(true);
    pCharacteristic->addDescriptor(pDescriptor);
    
    // Set callbacks for write events
    pCharacteristic->setCallbacks(new MyCallbacks());

    // Set initial value
    pCharacteristic->setValue("Hello from CarTag!");

    // Start the service
    pService->start();

    // Start advertising
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
    BLEDevice::startAdvertising();
    
    Serial.println("BLE device is ready and advertising!");
    Serial.print("Device name: CarTag");
    Serial.println();
}

void loop() {
    // Handle connection state changes
    if (deviceConnected && !oldDeviceConnected) {
        // Device just connected
        oldDeviceConnected = deviceConnected;
    }
    
    if (!deviceConnected && oldDeviceConnected) {
        // Device just disconnected
        delay(500);  // Give the bluetooth stack time to get ready
        pServer->startAdvertising();  // Restart advertising
        Serial.println("Restarted advertising");
        oldDeviceConnected = deviceConnected;
    }
    
    // If connected, you can send notifications
    if (deviceConnected) {
        unsigned long currentTime = millis();
        
        // Send battery update every 2 seconds
        if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
            lastUpdateTime = currentTime;
            updateCount++;
            
            // Decrease battery by 1% every 3 updates
            if (updateCount >= 3 && batteryLevel > 0) {
                batteryLevel--;
                updateCount = 0;
            }
            
            // Send battery level as string
            String batteryStr = String(batteryLevel) + "%";
            pCharacteristic->setValue(batteryStr.c_str());
            pCharacteristic->notify();
            
            Serial.print("Battery level: ");
            Serial.println(batteryStr);
        }
    }
    
    delay(10);  // Small delay to prevent watchdog issues
}
