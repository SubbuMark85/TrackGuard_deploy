/*
  TrackGuard - Smart Safety Band ESP32-C3 Firmware (Instant Hardware Response)
  ----------------------------------------------------------------------------
  Microcontroller: ESP32-C3 SuperMini
  Pins: GPS (Pin 0 RX, Pin 1 TX), SOS (Pin 9), Buzzer (Pin 10), RGB (Pin 3 Red, Pin 4 Green, Pin 5 Blue)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

// ==========================================
// CONFIGURATION: WI-FI & FIREBASE RTDB
// ==========================================
const char* WIFI_SSID     = "iQOO Neo6";
const char* WIFI_PASSWORD = "IronmanMark85"; 
const char* FIREBASE_HOST = "https://trackguard-dd2d4-default-rtdb.firebaseio.com";
const char* DEVICE_ID     = "TG-BAND-01";

// ==========================================
// PIN ALLOCATION (ESP32-C3 SuperMini)
// ==========================================
#define GPS_RX_PIN      0     // Pin 0 -> Connect to GPS TX
#define GPS_TX_PIN      1     // Pin 1 -> Connect to GPS RX

#define SOS_PIN         9     // Pin 9 -> SOS Button (Active LOW)
#define BUZZER_PIN      8    // Pin 10 -> Siren Buzzer
#define RGB_RED_PIN     4     // Red LED Pin
#define RGB_GREEN_PIN   3     // Green LED Pin
#define RGB_BLUE_PIN    5     // Blue LED Pin

// ==========================================
// GLOBALS & OBJECTS
// ==========================================
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

const unsigned long ALARM_DURATION_MS = 10000; // 10-Second Auto-Stop Siren
unsigned long sosStartTime = 0;
unsigned long lastSosPostTime = 0;
const unsigned long SOS_POST_COOLDOWN = 5000; // 5-Second Cooldown between alert posts
volatile bool sosActive = false;
volatile bool pendingSosCloudPost = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 5000; // 5 seconds

unsigned long lastCommandCheckTime = 0;
const unsigned long COMMAND_CHECK_INTERVAL = 3000; // 3 seconds

float currentLat = 13.082711; // Demo fallback coordinates
float currentLng = 80.270722;
float currentSpeed = 0.0;
int satCount = 8;
int batteryLevelPct = 88;

// ==========================================
// HARDWARE HELPER FUNCTIONS
// ==========================================
void setRGB(uint8_t r, uint8_t g, uint8_t b) {
  // Drive Red, Green, and Blue PWM pins at 100% full brightness scale (0-255)
  analogWrite(RGB_RED_PIN, r);
  analogWrite(RGB_GREEN_PIN, g);
  analogWrite(RGB_BLUE_PIN, b);
}

void normalLED()       { setRGB(0, 255, 0); }    // Green = Safe
void wifiConnectedLED(){ setRGB(0, 128, 255); }  // Cyan/Blue = Cloud Connected
void gpsSearchingLED() { setRGB(255, 150, 0); }  // Yellow = GPS Searching
void emergencyLED()    { setRGB(255, 0, 0); }    // Red = SOS Active

void buzzerON() {
  digitalWrite(BUZZER_PIN, HIGH);
}

void buzzerOFF() {
  digitalWrite(BUZZER_PIN, LOW);
}

// ==========================================
// INSTANT INTERRUPT HANDLER FOR BUTTON
// ==========================================
volatile unsigned long lastInterruptTime = 0;

void IRAM_ATTR handleSosInterrupt() {
  unsigned long now = millis();
  if (now - lastInterruptTime > 300) { // 300ms software debounce
    pendingSosCloudPost = true;
    lastInterruptTime = now;
  }
}

// ==========================================
// FIREBASE REALTIME DATABASE REST API
// ==========================================
void postLocationToFirebase(float lat, float lng, float speed, int sats, int batt) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/location/current.json";
  http.begin(url);
  http.setTimeout(1500); // 1.5s timeout max
  http.addHeader("Content-Type", "application/json");

  String jsonString = "{\"lat\":" + String(lat, 6) +
                      ",\"lng\":" + String(lng, 6) +
                      ",\"speed\":" + String(speed, 1) +
                      ",\"satellites\":" + String(sats) +
                      ",\"battery\":" + String(batt) +
                      ",\"timestamp\":" + String(millis()) + "}";

  int httpCode = http.PUT(jsonString);
  if (httpCode > 0) {
    Serial.printf("[Firebase REST] 📍 Location updated successfully. Code: %d\n", httpCode);
  }
  http.end();
}

void postAlertToFirebase(const char* type, const char* title, const char* msg) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/alerts.json";
  http.begin(url);
  http.setTimeout(1500);
  http.addHeader("Content-Type", "application/json");

  String jsonString = "{\"type\":\"" + String(type) +
                      "\",\"severity\":\"critical\",\"title\":\"" + String(title) +
                      "\",\"message\":\"" + String(msg) +
                      "\",\"lat\":" + String(currentLat, 6) +
                      ",\"lng\":" + String(currentLng, 6) +
                      ",\"status\":\"active\",\"device\":\"" + String(DEVICE_ID) +
                      "\",\"timestamp\":" + String(millis()) + "}";

  int httpCode = http.POST(jsonString);
  Serial.printf("[Firebase REST] 🚨 SOS Alert Posted! Code: %d\n", httpCode);
  http.end();
}

void checkFirebaseCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/bands/" + DEVICE_ID + "/commands.json";
  http.begin(url);
  http.setTimeout(1500);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();

    if (payload.indexOf("BUZZER") != -1 && payload.indexOf("\"executed\":true") == -1 && payload.indexOf("\"executed\": true") == -1) {
      Serial.println("\n=================================");
      Serial.println("  🌐 CLOUD COMMAND RECEIVED FROM WEB!");
      Serial.println("=================================");

      sosActive = true;
      sosStartTime = millis();
      buzzerON();
      emergencyLED();

      // Mark command as executed
      HTTPClient ackHttp;
      ackHttp.begin(String(FIREBASE_HOST) + "/bands/" + DEVICE_ID + "/commands/executed.json");
      ackHttp.setTimeout(1000);
      ackHttp.addHeader("Content-Type", "application/json");
      ackHttp.PUT("true");
      ackHttp.end();
    }
  }
  http.end();
}

// ==========================================
// SETUP & LOOP
// ==========================================
void setup() {
  Serial.begin(115200);

  unsigned long start = millis();
  while (!Serial && millis() - start < 2000) delay(10);

  Serial.println("\n========================================");
  Serial.println("  TRACKGUARD ESP32-C3 SUPERMINI BAND READY");
  Serial.println("========================================");

  pinMode(SOS_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  buzzerOFF();

  // Hardware Pin Interrupt on SOS Button (Pin 9)
  attachInterrupt(digitalPinToInterrupt(SOS_PIN), handleSosInterrupt, FALLING);

  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  setRGB(0, 0, 0);
  gpsSearchingLED();

  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  Serial.printf("[Wi-Fi] Connecting to %s...", WIFI_SSID);
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 30) {
    delay(400);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected! IP: " + WiFi.localIP().toString());
    wifiConnectedLED();
  } else {
    Serial.println("\n[Wi-Fi] Connection failed! Running in offline fallback mode.");
    normalLED();
  }

  Serial.println("\nSYSTEM READY - Press SOS button (Pin 9) to test emergency.");
}

void loop() {
  // 1. Read GPS Serial Stream
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        currentLat = gps.location.lat();
        currentLng = gps.location.lng();
        currentSpeed = gps.speed.kmph();
      }
    }
  }

  // 2. Instant SOS Hardware Trigger (Fired by Interrupt or Loop)
  static bool previousButtonState = HIGH;
  bool currentButtonState = digitalRead(SOS_PIN);

  if (!sosActive && (millis() - lastSosPostTime >= SOS_POST_COOLDOWN) && ((previousButtonState == HIGH && currentButtonState == LOW) || pendingSosCloudPost)) {
    pendingSosCloudPost = false;
    lastSosPostTime = millis();

    Serial.println("\n================================");
    Serial.println("   🚨 HARDWARE SOS BUTTON PRESSED!");
    Serial.println("================================");

    sosActive = true;
    sosStartTime = millis();
    emergencyLED();
    buzzerON();

    // Post to cloud
    postAlertToFirebase("sos_push_button", "Hardware SOS Button Pressed", "Distress button pressed on ESP32-C3 band");
    postLocationToFirebase(currentLat, currentLng, currentSpeed, satCount, batteryLevelPct);

    delay(100);
  }
  previousButtonState = currentButtonState;

  // 3. 2-Second Auto-Stop Siren Timer
  if (sosActive) {
    if (millis() - sosStartTime >= ALARM_DURATION_MS) {
      sosActive = false;
      buzzerOFF();
      Serial.println("\n[SYSTEM] ⏰ 2s Alarm Auto-Stopped");
      WiFi.status() == WL_CONNECTED ? wifiConnectedLED() : normalLED();
    }
  }

  // 4. Periodic Telemetry (every 5 seconds)
  static bool wasConnected = false;
  bool isConnected = (WiFi.status() == WL_CONNECTED);
  if (isConnected != wasConnected) {
    wasConnected = isConnected;
    if (!sosActive) {
      isConnected ? wifiConnectedLED() : normalLED();
    }
  }

  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = millis();
    Serial.printf("[Telemetry] Lat: %.5f | Lng: %.5f | Sats: %d\n", currentLat, currentLng, satCount);
    postLocationToFirebase(currentLat, currentLng, currentSpeed, satCount, batteryLevelPct);
  }

  // 5. Periodic Web Command Check (every 3 seconds)
  if (!sosActive && (millis() - lastCommandCheckTime >= COMMAND_CHECK_INTERVAL)) {
    lastCommandCheckTime = millis();
    checkFirebaseCommands();
  }

  delay(10);
}
