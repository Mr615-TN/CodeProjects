const int buttonPin = 2;
const int buzzerPin = 8;
int buttonState = 0;

void setup() {
  // put your setup code here, to run once:
  pinMode(buttonPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  unsigned char i;
  buttonState = digitalRead(buttonPin);
  
  if (buttonState == HIGH)
  {
    for (i = 0; i < 50; i++) {
      digitalWrite(buzzerPin, HIGH);
      delay(3);
      digitalWrite(buzzerPin,LOW);
      delay(3);
    }
    for (i = 0; i < 80; i++) {
      digitalWrite(buzzerPin, HIGH);
      delay(5);
      digitalWrite(buzzerPin, LOW);
      delay(5);
    }
  }

}
