void setup() {
  // put your setup code here, to run once:
  for (int i = 2; i <= 9; i++) {
    pinMode(i,OUTPUT);
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  for (int a = 2; a <= 9; a++) {
    digitalWrite(a, HIGH);
    delay(50);
  }
  for (int a = 9; a >= 2; a--) {
    digitalWrite(a, LOW);
    delay(50);
  }
  for (int a = 9; a >= 2; a--) {
    digitalWrite(a, HIGH);
    delay(50);
  }
  for (int a = 2; a <= 9; a++) {
    digitalWrite(a, LOW);
    delay(50);
  }
}
