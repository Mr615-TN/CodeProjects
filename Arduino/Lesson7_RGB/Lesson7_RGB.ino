const int redPin = 11;
const int greenPin = 10;
const int bluePin = 9;

void setup() {
  // put your setup code here, to run once:
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

}

void loop() {
  // put your main code here, to run repeatedly:
  color(255,0,0);
  delay(1000);
  color(0,255,0);
  delay(1000);
  color(0, 0, 255); // turn the RGB LED blue  
  delay(1000); // delay for 1 second 
  // Example blended colors:  
  color(255,0,252); // turn the RGB LED red  
  delay(1000); // delay for 1 second  
  color(237,109,0); // turn the RGB LED orange  
  delay(1000); // delay for 1 second  
  color(255,215,0); // turn the RGB LED yellow  
  delay(1000); // delay for 1 second  
  color(34,139,34); // turn the RGB LED green  
  delay(1000); // delay for 1 second 
  color(0,112,255); // turn the RGB LED blue  
  delay(1000); // delay for 1 second
  color(0,46,90); // turn the RGB LED  indigo 
  delay(1000); // delay for 1 second
  color(128,0,128); // turn the RGB LED purple  
  delay(1000); // delay for 1 second

}
void color (unsigned char red, unsigned char green, unsigned char blue) {
  analogWrite(redPin, red);
  analogWrite(greenPin, green);
  analogWrite(bluePin, blue);
}
