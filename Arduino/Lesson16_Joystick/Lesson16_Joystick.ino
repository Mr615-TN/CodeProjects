/**************************************************
   Name:Joystick PS2
   Description: the coordinates of X and Y axes displayed on Serial Monitor will change accordingly.
   press the button, and the coordinate of Z=0 will also be displayed.
   Email:support@sunfounder.com
   Website:www.sunfounder.com
 ********************************************************/

const int xPin = A0;  //the VRX attach to
const int yPin = A1;  //the VRY attach to
const int swPin = 8;  //the SW attach to
const int ledPin = 13;


void setup()
{
  pinMode(swPin, INPUT_PULLUP);  //set the SW pin to INPUT_PULLUP
  digitalWrite(swPin, HIGH);   //And initial value is HIGH
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop()
{
  int xValue = analogRead(xPin); // read the value of VRX
  int yValue = analogRead(yPin); // read the value of VRY
  int zValue = digitalRead(swPin); // read the value of SW
   // Check if the joystick is moved in any direction
  if (abs(xValue - 512) > 50 || abs(yValue - 512) > 50) { // threshold of 50 to ignore small noise
    digitalWrite(ledPin, HIGH); // turn on the LED
  } else {
    digitalWrite(ledPin, LOW);  // turn off the LED
  }
  Serial.print("X: "); 
  Serial.print(xValue);  // print the value of VRX in DEC
  Serial.print("|Y: ");
  Serial.print(yValue);  // print the value of VRX in DEC
  Serial.print("|Z: ");
  Serial.println(zValue);   // print the value of SW
  delay(50);
}
