# TSS721ADR Wired M-Bus Module Documentation (S0 Baseboard)

## Overview

The **TSS721ADR** is a **Wired M-Bus (Meter-Bus) transceiver** designed for reliable communication with **wired M-Bus compliant utility meters**, such as **water, heat, gas, and electricity meters**.

On the **S0 Baseboard**, the TSS721ADR enables **direct physical connection** to wired M-Bus meters and acts as the **physical layer interface** between the meters and the S0 board.

This module allows the S0 board to collect meter data from the Baseboard and forward it to SuperMQ via protocols like MQTT, CoAP, HTTP and the rest.

---

## What is Wired M-Bus?

**Wired M-Bus (EN 13757-2 / EN 13757-3)** is a European standard for wired meter reading. It supports:

- Multi-drop bus topology
- Long cable lengths
- Low power consumption at the meter
- Reliable communication in industrial environments

Wired M-Bus is commonly used in:

- Apartment buildings
- Industrial facilities
- District heating systems
- Utility metering cabinets

---

## Role of the TSS721ADR on the S0 Board

The TSS721ADR performs the following functions:

- Provides **voltage level shifting** and **signal conditioning** for the M-Bus line
- Handles **current modulation and detection**
- Protects the MCU from direct exposure to the M-Bus line
- Enables **half-duplex communication** over the M-Bus

S0 communicates with the TSS721ADR using the **UART interface**, while the TSS721ADR interfaces with the **M-Bus lines (MBUS+ / MBUS−)**.

---

## Key Features of the TSS721ADR

- Fully compliant with **Wired M-Bus standards**
- Supports **master mode operation**
- Integrated current limiting and line protection
- Operates from a single supply voltage
- UART-based interface to the host MCU
- Industrial-grade reliability

---

## Hardware Connections (Typical)

### MCU ↔ TSS721ADR

| Signal | Description      |
| ------ | ---------------- |
| TX     | UART TX to MCU   |
| RX     | UART RX from MCU |
| VB     | Power supply     |
| GND    | Ground           |

### TSS721ADR ↔ Meter Bus

| Signal | Description  |
| ------ | ------------ |
| MBUS+  | M-Bus line   |
| MBUS−  | M-Bus return |

---

## How to Test the TSS721ADR Module

### 1. Prerequisites

Before testing, ensure you have:

- S0 Baseboard powered
- S0, or a microcontroller of your choice powered and programmed
- A **wired M-Bus compatible meter** or a (12-42)V DC power supply connected at the MBUS lines with the proper M-Bus wiring (polarity observed)
- Serial logging enabled on the S0 or Microcontroller of your choice
- Correct UART configuration (typically 2400 or 9600 baud)

---

### 2. Electrical Verification

1. Measure voltage on the **M-Bus lines**:
   - Typical M-Bus idle voltage: **(12–42) V**
2. Verify the TSS721ADR is powered correctly

---

### 3. UART Communication Test

Configure the MCU UART connected to the TSS721ADR:

- Baud rate: **2400 / 9600**
- Data bits: **8**
- Parity: **Even**
- Stop bits: **1**

Send a simple test frame from the MCU and observe UART activity.

Example code for this test can be found in the [Wired MBUS test code](https://github.com/absmach/s0-docs/blob/mbus-work/test-codes)
