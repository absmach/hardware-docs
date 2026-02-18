#include <SPI.h>

// SPI Pins for ESP32C6
#define PIN_SPI_MOSI 23
#define PIN_SPI_MISO 19
#define PIN_SPI_SCK  18
#define PIN_SPI_CS   5

// Optional Interrupt Pin
#define PIN_GDO0     4

// S2LP Command Strobes / Registers
#define CMD_SRES     0xFE // RESET
#define CMD_SNOP     0x00 // NO OP

// Define buffer size for TX / RX
#define BUFFER_SIZE 64

SPIClass *vspi = NULL;

void rcS2lpWriteReg(uint8_t reg, uint8_t value) {
  digitalWrite(PIN_SPI_CS, LOW);
  vspi->transfer(reg | 0x00);  // WRITE
  vspi->transfer(value);
  digitalWrite(PIN_SPI_CS, HIGH);
}

uint8_t rcS2lpReadReg(uint8_t reg) {
  digitalWrite(PIN_SPI_CS, LOW);
  vspi->transfer(reg | 0x80);  // READ
  uint8_t value = vspi->transfer(0);
  digitalWrite(PIN_SPI_CS, HIGH);
  return value;
}

void rcS2lpStrobe(uint8_t cmd) {
  digitalWrite(PIN_SPI_CS, LOW);
  vspi->transfer(cmd);
  digitalWrite(PIN_SPI_CS, HIGH);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("RC-S2LP Wireless M-Bus SPI Test");

  pinMode(PIN_SPI_CS, OUTPUT);
  digitalWrite(PIN_SPI_CS, HIGH);

  pinMode(PIN_GDO0, INPUT);

  // Initialize VSPI
  vspi = new SPIClass(VSPI);
  vspi->begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

  // Hardware reset RC-S2LP if needed (wire RESET pin)
  // pinMode(PIN_RESET, OUTPUT);
  // digitalWrite(PIN_RESET, LOW);
  // delay(100);
  // digitalWrite(PIN_RESET, HIGH);
  // delay(100);

  // Reset chip
  Serial.println("Sending chip reset...");
  rcS2lpStrobe(CMD_SRES);
  delay(100);

  // Read version / part number (example register)
  uint8_t partnum = rcS2lpReadReg(0x01); // PARTNUM register addr
  Serial.print("Part Number: 0x"); Serial.println(partnum, HEX);

  // Set some basic registers (Example — see datasheet)
  Serial.println("Configuring basic registers...");
  rcS2lpWriteReg(0x02, 0x01); // Example: Write some register

  Serial.println("Ready!");
}

void loop() {
  static uint32_t lastSend = 0;

  // Example: Transmit a test packet every 5 seconds
  if (millis() - lastSend > 5000) {
    lastSend = millis();

    Serial.println("Sending test packet...");

    // Build test packet
    uint8_t packet[] = "HELLO FROM ESP32-C6";
    uint8_t packetSize = sizeof(packet);

    // Send strobe for TX FIFO loading (depends on S2LP FIFO interface)
    digitalWrite(PIN_SPI_CS, LOW);
    vspi->transfer(0x66); // WRITE FIFO command (example)
    for (uint8_t i = 0; i < packetSize; i++) {
      vspi->transfer(packet[i]);
    }
    digitalWrite(PIN_SPI_CS, HIGH);

    // Strobe TX (example)
    rcS2lpStrobe(0x35); // STX

    Serial.println("Packet sent!");
  }

  // Example: Basic receive check
  if (digitalRead(PIN_GDO0) == HIGH) {
    Serial.println("Packet received!");
    uint8_t rxBuf[BUFFER_SIZE];

    // Read RX FIFO (example)
    digitalWrite(PIN_SPI_CS, LOW);
    vspi->transfer(0x7F); // READ FIFO command
    for (uint8_t i = 0; i < BUFFER_SIZE; i++) {
      rxBuf[i] = vspi->transfer(0);
    }
    digitalWrite(PIN_SPI_CS, HIGH);

    Serial.print("Data: ");
    for (uint8_t i = 0; i < BUFFER_SIZE; i++) {
      Serial.write(rxBuf[i]);
    }
    Serial.println();
  }
}
