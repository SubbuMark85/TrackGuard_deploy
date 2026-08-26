/*
  TrackGuard - Smart Safety Band ESP32-C3 Firmware
  ------------------------------------------------
  Built for Smart India Hackathon (SIH) Showcase
  Microcontroller: ESP32-C3 (RISC-V Wi-Fi + BLE)
  Firebase Realtime Database: https://trackguard-dd2d4-default-rtdb.firebaseio.com/

  Hardware Components Integrated:
  1. ESP32-C3 SoC
  2. Neo-6M / GT-U7 GPS Module (UART1: RX=GPIO20, TX=GPIO21)
  3. SOS Push Button (GPIO3 - Active LOW with Internal Pullup & Interrupt)
  4. Tamper / Disconnect Wristband Sensor (GPIO4 - Active LOW Latch Switch)
  5. Li-Po Battery Monitoring (GPIO1 - ADC1_CH0 Voltage Divider)
  6. Vibration Motor (GPIO5 - Haptic PWM Output) & Buzzer (GPIO6 - Tone Siren PWM Output)
  7. RGB LED (GPIO8: Red, GPIO9: Green, GPIO10: Blue or WS2812 Data)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>

// ==========================================
// CONFIGURATION: WI-FI & FIREBASE RTDB
// ==========================================
const char* WIFI_SSID = "TrackGuard_Hotspot";     // Change to your Wi-Fi SSID
const char* WIFI_PASSWORD = "Password123";         // Change to your Wi-Fi Password
const char* FIREBASE_HOST = "https://trackguard-dd2d4-default-rtdb.firebaseio.com";
const char* DEVICE_ID = "TG-BAND-01";

// ==========================================
// PIN ALLOCATION (ESP32-C3 PINOUT)
// ==========================================
#define PIN_BATTERY_ADC       1     // ADC1_CH0 - Li-Po Battery Level Sensing
#define PIN_SOS_BTN           3     // SOS Push Button Input (Interrupt)
#define PIN_TAMPER_SWITCH     4     // Wristband Tension Disconnect Switch
#define PIN_VIBRATION         5     // Vibration Motor Output (PWM Haptic)
#define PIN_BUZZER            6     // Audio Siren Buzzer Output (PWM Tone)
#define PIN_RGB_RED           8     // RGB LED Red Channel
#define PIN_RGB_GREEN         9     // RGB LED Green Channel
#define PIN_RGB_BLUE          10    // RGB LED Blue Channel
#define PIN_GPS_RX            20    // ESP32-C3 UART RX -> Connects to GPS TX
#define PIN_GPS_TX            21    // ESP32-C3 UART TX -> Connects to GPS RX

// ==========================================
// GLOBALS & OBJECTS
// ==========================================
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

volatile bool sosTriggered = false;
volatile bool tamperTriggered = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 10000; // 10 seconds

unsigned long lastCommandCheckTime = 0;
const unsigned long COMMAND_CHECK_INTERVAL = 2000; // 2 seconds

int batteryLevelPct = 84;
float currentLat = 11.4138;
float currentLng = 76.6958;
float currentSpeed = 0.0;
int satCount = 12;

enum HardwareMode { MODE_NORMAL, MODE_SOS, MODE_TAMPER, MODE_UNLOCKED };
HardwareMode currentMode = MODE_NORMAL;

// ==========================================
// INTERRUPT SERVICE ROUTINES
// ==========================================
void IRAM_ATTR handleSosInterrupt() {
  sosTriggered = true;
}

void IRAM_ATTR handleTamperInterrupt() {
  tamperTriggered = true;
}

// ==========================================
// HARDWARE HELPER FUNCTIONS
// ==========================================
void setRGBColor(uint8_t r, uint8_t g, uint8_t b) {
  analogWrite(PIN_RGB_RED, r);
  analogWrite(PIN_RGB_GREEN, g);
  analogWrite(PIN_RGB_BLUE, b);
}

void playSirenPattern(int durationMs) {
  unsigned long start = millis();
  while (millis() - start < durationMs) {
    for (int hz = 800; hz <= 1800; hz += 50) {
      tone(PIN_BUZZER, hz, 15);
      delay(5);
    }
  }
  noTone(PIN_BUZZER);
}

void triggerVibrationPulse(int pulseCount, int onMs, int offMs) {
  for (int i = 0; i < pulseCount; i++) {
    digitalWrite(PIN_VIBRATION, HIGH);
    delay(onMs);
    digitalWrite(PIN_VIBRATION, LOW);
    delay(offMs);
  }
}

int readBatteryPercentage() {
  // Reads voltage divider (e.g. 100k + 100k) on GPIO1
  int rawADC = analogRead(PIN_BATTERY_ADC);
  float voltage = (rawADC / 4095.0) * 3.3 * 2.0; // Scaled for divider
  int pct = (int)((voltage - 3.2) / (4.2 - 3.2) * 100.0);
  return constrain(pct, 0, 100);
}

// ==========================================
// FIREBASE REALTIME DATABASE REST API
// ==========================================
void postLocationToFirebase(float lat, float lng, float speed, int sats, int batt) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/location/current.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["lat"] = lat;
  doc["lng"] = lng;
  doc["speed"] = speed;
  doc["satellites"] = sats;
  doc["battery"] = batt;
  doc["timestamp"] = millis();

  String jsonString;
  serializeJson(doc, jsonString);

  int httpCode = http.PUT(jsonString);
  if (httpCode > 0) {
    Serial.printf("[Firebase] Location updated successfully. Code: %d\n", httpCode);
  } else {
    Serial.printf("[Firebase] HTTP error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void postAlertToFirebase(const char* type, const char* title, const char* msg) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/alerts.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["type"] = type;
  doc["severity"] = "critical";
  doc["title"] = title;
  doc["message"] = msg;
  doc["lat"] = currentLat;
  doc["lng"] = currentLng;
  doc["status"] = "active";
  doc["device"] = DEVICE_ID;
  doc["timestamp"] = millis();

  String jsonString;
  serializeJson(doc, jsonString);

  int httpCode = http.POST(jsonString);
  Serial.printf("[Firebase] Alert posted. Response: %d\n", httpCode);
  http.end();
}

void checkFirebaseCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/bands/" + DEVICE_ID + "/commands.json";
  http.begin(url);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    if (payload != "null" && payload.length() > 5) {
      StaticJsonDocument<256> doc;
      DeserializationError err = deserializeJson(doc, payload);
      if (!err) {
        const char* type = doc["type"];
        bool executed = doc["executed"] | false;

        if (!executed && type != NULL) {
          Serial.printf("[Command Received] Type: %s\n", type);

          if (strcmp(type, "BUZZER") == 0) {
            playSirenPattern(1500);
          } else if (strcmp(type, "VIBRATION") == 0) {
            triggerVibrationPulse(3, 300, 150);
          } else if (strcmp(type, "SET_RGB") == 0) {
            const char* mode = doc["payload"]["mode"];
            if (strcmp(mode, "SOS_RED") == 0) setRGBColor(255, 0, 0);
            else if (strcmp(mode, "TAMPER_ORANGE") == 0) setRGBColor(255, 128, 0);
            else if (strcmp(mode, "CHARGING_BLUE") == 0) setRGBColor(0, 128, 255);
            else setRGBColor(0, 255, 128);
          } else if (strcmp(type, "UNLOCK_STRAP") == 0) {
            currentMode = MODE_UNLOCKED;
            setRGBColor(0, 128, 255); // Blue LED disengaged mode
            triggerVibrationPulse(2, 500, 200);
          }

          // Mark command executed
          HTTPClient ackHttp;
          String ackUrl = String(FIREBASE_HOST) + "/bands/" + DEVICE_ID + "/commands/executed.json";
          ackHttp.begin(ackUrl);
          ackHttp.addHeader("Content-Type", "application/json");
          ackHttp.PUT("true");
          ackHttp.end();
        }
      }
    }
  }
  http.end();
}

// ==========================================
// SETUP & MAIN LOOP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== TrackGuard ESP32-C3 Safety Band Initializing ===");

  // Pin Configuration
  pinMode(PIN_SOS_BTN, INPUT_PULLUP);
  pinMode(PIN_TAMPER_SWITCH, INPUT_PULLUP);
  pinMode(PIN_VIBRATION, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_RGB_RED, OUTPUT);
  pinMode(PIN_RGB_GREEN, OUTPUT);
  pinMode(PIN_RGB_BLUE, OUTPUT);

  // Attach Interrupts
  attachInterrupt(digitalPinToInterrupt(PIN_SOS_BTN), handleSosInterrupt, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_TAMPER_SWITCH), handleTamperInterrupt, RISING);

  // Initial RGB LED Test (Cyan pairing state)
  setRGBColor(0, 255, 255);
  digitalWrite(PIN_VIBRATION, HIGH);
  delay(200);
  digitalWrite(PIN_VIBRATION, LOW);

  // GPS Hardware Serial Setup
  gpsSerial.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  Serial.println("[Hardware] GPS Serial initialized on pins RX=20, TX=21");

  // Wi-Fi Connection
  Serial.printf("[Wi-Fi] Connecting to %s...", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected! IP Address: " + WiFi.localIP().toString());
    setRGBColor(0, 255, 0); // Green LED normal operational mode
  } else {
    Serial.println("\n[Wi-Fi] Connection failed! Running in offline fallback mode.");
    setRGBColor(255, 255, 0); // Yellow LED warning
  }
}

void loop() {
  // Read GPS Serial Stream
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        currentLat = gps.location.lat();
        currentLng = gps.location.lng();
        currentSpeed = gps.speed.kmph();
        satCount = gps.satellites.value();
      }
    }
  }

  // Check Interrupt Signals
  if (sosTriggered) {
    sosTriggered = false;
    currentMode = MODE_SOS;
    Serial.println("[ALERT] Hardware SOS Push Button Triggered!");

    setRGBColor(255, 0, 0);
    triggerVibrationPulse(3, 400, 100);
    playSirenPattern(2000);

    postAlertToFirebase("sos_push_button", "Hardware SOS Button Pressed", "Distress button pressed on ESP32-C3 band");
  }

  if (tamperTriggered) {
    tamperTriggered = false;
    currentMode = MODE_TAMPER;
    Serial.println("[ALERT] Wristband Tamper / Disconnect Switch Breach!");

    setRGBColor(255, 128, 0);
    triggerVibrationPulse(2, 600, 200);

    postAlertToFirebase("tamper_disconnect", "Wristband Disconnect Breach", "Strap tension switch unlatched without guardian authorization");
  }

  // Mode LED Indicators
  if (currentMode == MODE_SOS) {
    setRGBColor((millis() / 250) % 2 ? 255 : 0, 0, 0); // Fast Flashing Red
  } else if (currentMode == MODE_TAMPER) {
    setRGBColor((millis() / 500) % 2 ? 255 : 0, (millis() / 500) % 2 ? 128 : 0, 0); // Orange pulse
  }

  // Periodic Telemetry Publishing
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = millis();
    batteryLevelPct = readBatteryPercentage();

    Serial.printf("[Telemetry] Lat: %.5f | Lng: %.5f | Speed: %.1f km/h | Sats: %d | Batt: %d%%\n",
                  currentLat, currentLng, currentSpeed, satCount, batteryLevelPct);

    postLocationToFirebase(currentLat, currentLng, currentSpeed, satCount, batteryLevelPct);
  }

  // Check Remote Web App Commands
  if (millis() - lastCommandCheckTime >= COMMAND_CHECK_INTERVAL) {
    lastCommandCheckTime = millis();
    checkFirebaseCommands();
  }

  delay(10);
}
