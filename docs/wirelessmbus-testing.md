# RC-S2LP Wireless M-Bus Transceiver

## Overview, Hardware Connection, and Test Procedure

## Introduction

The **RC-S2LP** is a sub-GHz RF transceiver module based on the **STMicroelectronics S2-LP** radio IC. It is commonly used in **Wireless M-Bus (wM-Bus)**, **smart metering**, and **low-power IoT gateway** applications operating in the **868 MHz ISM band**.

In the **S0 board**, the RC-S2LP is responsible for receiving and transmitting Wireless M-Bus frames from devices such as heat meters, water meters, and gas meters.

---

## What the RC-S2LP Module Is Used For

The RC-S2LP enables:

- Wireless M-Bus communication (T1, T2, C1, C2 modes)
- Sub-GHz long-range communication
- Low-power RF reception from battery-powered meters
- Gateway-to-meter RF communication
- Custom proprietary RF protocols

Typical applications include:

- Smart utility meters
- IoT gateways
- Industrial telemetry
- Building automation systems

---

## Key Specifications

| Feature           | Description                       |
| ----------------- | --------------------------------- |
| RF IC             | STMicroelectronics S2-LP          |
| Frequency Band    | 868 MHz ISM band                  |
| Modulation        | 2-FSK, GFSK, OOK, MSK             |
| Data Rate         | Up to 500 kbps                    |
| Output Power      | Up to +14 dBm                     |
| Sensitivity       | Down to −130 dBm (mode-dependent) |
| Interface         | SPI                               |
| Operating Voltage | 1.8 V – 3.6 V                     |
| Low-Power Modes   | Sleep, Standby                    |

---

## Hardware Connection

The RC-S2LP communicates with the host MCU using **SPI** and several control signals.

### Required Signals

| Signal | Description     |
| ------ | --------------- |
| MOSI   | SPI Master Out  |
| MISO   | SPI Master In   |
| SCK    | SPI Clock       |
| CS     | SPI Chip Select |
| VCC    | 3.3 V supply    |
| GND    | Ground          |
| RF     | 868 MHz antenna |

---

### Example Connection (ESP32)

| RC-S2LP Pin | MCU Pin  |
| ----------- | -------- |
| MOSI        | SPI MOSI |
| MISO        | SPI MISO |
| SCK         | SPI SCK  |
| CS          | GPIO     |
| VCC         | 3.3V     |
| GND         | GND      |

⚠️ Ensure a **proper 868 MHz antenna** is connected before transmitting.

---

## Software Test Procedure

### Test Objective

The test verifies that:

- The RC-S2LP is powered correctly
- SPI communication is functional
- Registers can be read and written
- RF transmission and reception work

---

## SPI Communication Test

Example code for this test can be found in the [Wireless MBUS test code](https://github.com/absmach/s0-docs/blob/mbus-work/test-codes)
