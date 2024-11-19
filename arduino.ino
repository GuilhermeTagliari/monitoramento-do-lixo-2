#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <TimeLib.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); 

void setup() {
    lcd.begin(16, 2);          
    lcd.backlight();           
    Serial.begin(9600);        
}

void loop() {
    if (Serial.available()) {
        String data = Serial.readStringUntil('\n'); 
        Serial.println("Dados recebidos: " + data);  

        int firstComma = data.indexOf(',');
        int secondComma = data.indexOf(',', firstComma + 1); 
        int thirdComma = data.indexOf(',', secondComma + 1); 


        String distancia_str = data.substring(0, firstComma);
        String volume_str = data.substring(firstComma + 1, secondComma);
        String percentual_str = data.substring(secondComma + 1, thirdComma);
        String estado_tampa = data.substring(thirdComma + 1);

        int percentual = percentual_str.toInt();


        estado_tampa.trim();

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Percentual: ");
        lcd.print(percentual);
        lcd.print("%");

        if (percentual > 75) {
            lcd.setCursor(0, 1);
            lcd.print("ALERTA: Lixo cheio");
        } else {
            lcd.setCursor(0, 1);
            lcd.print(estado_tampa); 
        }
    }
}
