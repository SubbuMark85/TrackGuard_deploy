# TrackGuard ESP32-C3 Hardware Schematic & Wiring Guide (SIH)

This guide documents the exact pin mapping and circuit setup for connecting the 7 hardware components to the **ESP32-C3** microcontroller and syncing with **Firebase Realtime Database** (`https://trackguard-dd2d4-default-rtdb.firebaseio.com`).

---

## Hardware Components List

| # | Component | Model / Type | Purpose |
|---|---|---|---|
| 1 | **Microcontroller** | ESP32-C3 (SuperMini / DevModule) | Processing, Wi-Fi connectivity, Firebase RTDB sync |
| 2 | **GPS Module** | Neo-6M / GT-U7 | Real-time latitude, longitude, satellite tracking |
| 3 | **SOS Push Button** | Tactile Switch (Momentary) | Panic button distress trigger |
| 4 | **Tamper / Disconnect Switch** | Microswitch / Cut-wire latch | Detects unauthorized wristband removal/cut |
| 5 | **Battery & Charger** | 3.7V 500mAh Li-Po + TP4056 | Portable power with battery voltage sensing |
| 6 | **Haptics & Siren** | 3V Vibration Motor + 5V Active Buzzer | Physical haptic feedback & alarm siren |
| 7 | **Visual Status Indicator** | Common Cathode RGB LED / WS2812B | Mode status (Green=Safe, Red=SOS, Orange=Tamper) |

---

## ESP32-C3 Pin Allocation Table

```
                         ESP32-C3 SuperMini
                          +--------------+
             ADC1_CH0 <---| GPIO1  GPIO0 |---> (NC)
             (NC)     <---| GPIO2  GPIO3 |---> SOS Push Button (Interrupt)
  Tamper Switch       <---| GPIO4  GPIO5 |---> Vibration Motor (PWM)
  Active Siren Buzzer <---| GPIO6  GPIO7 |---> (NC)
  RGB LED (Red)       <---| GPIO8  GPIO9 |---> RGB LED (Green)
  RGB LED (Blue)      <---| GPIO10 5V    |---> 5V Power Rail
  GPS Module (TX)     <---| GPIO20 GND   |---> Common Ground
  GPS Module (RX)     <---| GPIO21 3.3V  |---> 3.3V Power Rail
                          +--------------+
```

| Component | ESP32-C3 Pin | Wiring Notes |
|---|---|---|
| **GPS RX** | `GPIO21` | Connect to GPS Module **TX** pin |
| **GPS TX** | `GPIO20` | Connect to GPS Module **RX** pin |
| **SOS Push Button** | `GPIO3` | Connect switch to **GPIO3** and **GND** (Internal `INPUT_PULLUP` enabled) |
| **Tamper Sensor** | `GPIO4` | Connect microswitch latch to **GPIO4** and **GND** |
| **Battery ADC** | `GPIO1` | Connect through 100k + 100k voltage divider to Li-Po Positive terminal |
| **Vibration Motor** | `GPIO5` | Connect base of NPN transistor (2N2222) with 1k resistor to GPIO5 |
| **Buzzer** | `GPIO6` | Active piezo buzzer positive to GPIO6, negative to GND |
| **RGB LED (Red)** | `GPIO8` | Connect via 220Ω resistor to Red anode |
| **RGB LED (Green)**| `GPIO9` | Connect via 220Ω resistor to Green anode |
| **RGB LED (Blue)** | `GPIO10`| Connect via 220Ω resistor to Blue anode |

---

## Battery Voltage Sensing Divider Circuit (GPIO1)

Li-Po battery voltage (3.2V - 4.2V) exceeds ESP32-C3 maximum ADC input voltage (3.3V). Connect a 1:2 voltage divider:

```
 Li-Po Positive (+) ------ [ 100k Ω Resistor ] ------+------ GPIO1 (ESP32-C3 ADC)
                                                    |
                                            [ 100k Ω Resistor ]
                                                    |
 Ground (GND) --------------------------------------+
```

---

## Arduino IDE Configuration

1. Open **Arduino IDE** (v2.x recommended).
2. Go to **File -> Preferences** and add to Additional Board Manager URLs:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Go to **Tools -> Board -> Boards Manager**, search `esp32`, and install **esp32 by Espressif Systems** (version 2.0.11 or later).
4. Select **Tools -> Board -> ESP32-C3 Dev Module**.
5. Install required libraries from Library Manager (`Ctrl + Shift + I`):
   - **TinyGPSPlus** by Mikal Hart
   - **ArduinoJson** by Benoit Blanchon (v6.x)
6. Open `TrackGuard_ESP32C3.ino`, update `WIFI_SSID` and `WIFI_PASSWORD`, then click **Upload**!
