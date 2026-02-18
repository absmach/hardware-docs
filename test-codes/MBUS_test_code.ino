// TSS721A + ESP32 UART Test

// UART pins
#define MBUS_RX 18   // ESP32 receives from TSS721A TXD
#define MBUS_TX 19   // ESP32 transmits to TSS721A RXD


void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("TSS721A ESP32 M-Bus Test Starting...");

   Serial1.begin(2400, SERIAL_8E1, MBUS_RX, MBUS_TX);  
  // M-Bus default: 2400 baud, Even parity, 1 stop

  Serial.println("Ready. Listening for M-Bus data...");

}

void loop() {
  // Read data from M-Bus
  while (Serial1.available()) {
    byte b = Serial1.read();
    Serial.print("RX: 0x");
    Serial.println(b, HEX);
  }

  // Send test every 5 sec
  static uint32_t last = 0;
  if (millis() - last > 20000) {
    last = millis();

     while (Serial1.available()) {
    byte b = Serial1.read();
    Serial.print("RX: 0x");
    Serial.println(b, HEX);
    }

    byte pingFrame[] = { 0x10, 0x40, 0x40, 0x16 }; // Standard M-Bus SND-NKE
    Serial1.write(pingFrame, sizeof(pingFrame));

    Serial.println("TX: Sent SND-NKE frame (reset command)");
  }

}
