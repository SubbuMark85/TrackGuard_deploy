# TrackGuard ESP32-C3 Hardware Schematic & Wiring Guide

This guide documents the exact pin mapping and circuit setup for the **ESP32-C3 SuperMini** smart safety band hardware.

---

## 📌 ESP32-C3 SuperMini Header Pin Assignment Table

```
                  ESP32-C3 SuperMini Header
                       +--------------+
                 5V    | [ ]      [ ] | 5V / VBUS (Power In / Out)
                GND    | [ ]      [ ] | GND (Common Ground)
               3.3V    | [ ]      [ ] | 3.3V Power Rail
           GPS TX ---->| GPIO0  GPIO6 |---> SPI Flash CLK (Do Not Use)
           GPS RX ---->| GPIO1  GPIO7 |---> SPI Flash HD (Do Not Use)
                       | GPIO2  GPIO8 |---> General Purpose IO
           RGB RED <---| GPIO3  GPIO9 |---> SOS Push Button (Active LOW)
         RGB GREEN <---| GPIO4  GPIO10|---> Active Siren Buzzer
          RGB BLUE <---| GPIO5  TX    |---> GPIO21 (Hardware TX)
                       |        RX    |---> GPIO20 (Hardware RX)
                       +--------------+
```

### 🔌 Pin Connections

| # | Hardware Component | ESP32-C3 SuperMini Pin Label | Wiring Instructions |
|---|---|---|---|
| 1 | **GPS Module TX** | **`Pin 0`** | Connect GPS Module **TX** pin to ESP32 **Pin 0** (Hardware RX) |
| 2 | **GPS Module RX** | **`Pin 1`** | Connect GPS Module **RX** pin to ESP32 **Pin 1** (Hardware TX) |
| 3 | **3-Pin RGB LED (Red)** | **`Pin 3`** | Connect RGB LED **Red** pin to **Pin 3** |
| 4 | **3-Pin RGB LED (Green)** | **`Pin 4`** | Connect RGB LED **Green** pin to **Pin 4** |
| 5 | **3-Pin RGB LED (Blue)** | **`Pin 5`** | Connect RGB LED **Blue** pin to **Pin 5** |
| 6 | **SOS Push Button** | **`Pin 9`** | Connect Tactile Push Button between **Pin 9** and **GND** |
| 7 | **Active Buzzer** | **`Pin 10`** | Connect Active Buzzer positive wire to **Pin 10**, negative to **GND** |
| 8 | **Power & GND** | **`5V` / `GND`** | Connect VCC to **5V (VBUS)** and GND to **GND** |

---

## 🎨 RGB LED Status Modes (Pins 3, 4, 5)

| Color | Status Meaning | Trigger Condition |
|---|---|---|
| 🟢 **Green** | **Normal / Safe Mode** | Band powered on, GPS searching or active, no emergency |
| 🔵 **Blue** | **Bluetooth Paired** | Web App / Phone connected over BLE (`TRACKGUARD-BAND-001`) |
| 🟡 **Yellow** | **GPS Searching** | Powered on indoors, waiting for satellite lock |
| 🔴 **Red** | **EMERGENCY SOS** | SOS Push Button (Pin 9) pressed or remote alarm triggered |

---

## 🔊 Alarm Siren Behavior (Pin 10)

* **Trigger:** Pressing the SOS Button (Pin 9) or receiving `"START_ALARM"` BLE command.
* **Auto-Stop Timer:** The buzzer will sound for **10 seconds** and automatically turn off.
* **Manual Stop:** Receiving `"STOP_ALARM"` command via BLE immediately stops the alarm.

---

## 💻 Arduino IDE Setup Instructions

1. Open **Arduino IDE**.
2. Board Manager URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Select **Tools -> Board -> ESP32 Arduino -> ESP32C3 Dev Module**.
4. Configure Tools settings:
   * **USB CDC On Boot:** `Enabled`
   * **Upload Speed:** `921600` or `115200`
   * **Port:** Select `COMx` (ESP32-C3 Serial Port)
5. Install Libraries via Library Manager (`Ctrl + Shift + I`):
   * `TinyGPSPlus` by Mikal Hart
   * `Adafruit NeoPixel` by Adafruit
6. Upload `TrackGuard_ESP32C3.ino` and open **Serial Monitor** at **115200 Baud**.
