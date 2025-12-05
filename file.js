//define variable to hold the html element or div that contains p5js sketch
let cnvPosition;
//define variable to hold the p5js canvas
let cnv;

let serial = new p5.WebSerial();
// let portName = '/dev/cu.usbmodem101';
let inData = serial.read();        // most recent sensor reading from Arduino
let threshold = 500;  // threshold to decide over/under

let blackoutTimer = 0;
let blackoutActive = false;

let img;


// Listen for ALL clicks and filter down to Twine links
window.addEventListener("click", function (event) {
  // Twine Harlowe uses <tw-link> for links
  const linkEl = event.target.closest("tw-link, .link");
  if (!linkEl) return;

  // Get the visible text of the link
  let label = (linkEl.textContent || "").trim();

  // Normalize spaces so weird spacing in Twine doesn't break matching
  label = label.replace(/\s+/g, " ");

  // Adjust threshold based on which choice was clicked
  switch (label) {
    case "Start conversation like you would always do":
      threshold += 50;
      break;

    case "End conversation cause you have other responsibilities":
      threshold -= 50;
      break;

    case "Try to end conversation by making up responsibilities that you do not have":
      threshold -= 50;
      break;

    case "Rizz the character up":
      threshold += 50;
      break;

    case "Offer small comfort":
      threshold -= 50;
      break;

    case "Make a strange scientific observation":
      threshold += 50;
      break;

    case "Challenge their logic":
      threshold += 50;
      break;

    case "Give them a strange gift":
      threshold -= 50;
      break;

    case "Ask the question you’ve been avoiding":
      threshold -= 50;
      break;

    case "Playfully annoy them":
      threshold += 50;
      break;

    // In your Twine passage this is currently spelled "coplain"
    case "coplain about getting banned":
    case "complain about getting banned":
      threshold -= 50;
      break;

    case "Confess your problems lately":
      threshold += 50;
      break;

    default:
      // Some other Twine link – ignore
      return;
  }

  console.log("Choice picked:", label, "→ new threshold =", threshold);
});


function preload() {
  img = loadImage("normal.png");
}

let blackout;

function setup() {
  //create the canvas in the variable cnv
  cnv = createCanvas(windowWidth, windowHeight);
  //attach the canvas to the div p5-container
  cnv.parent("p5-container"); 
  //put the div p5-container in the variable
  cnvPosition = document.getElementById('p5-container');

  if (!navigator.serial) {
    alert("WebSerial is not supported in this browser.");
  }

  // // set up serial communication
  setupSerial();
  background(0);

  blackout = document.getElementById("blackout");
}

function draw() {

  //call character image
  background(0);
  image(img, mouseX - img.width/4, mouseY - img.height/4);


  //toggle the z-index (which controls the layering of the HTML page)
if (inData < threshold) {
  // normal visibility
  cnvPosition.style.zIndex = "1";
  //triggerBlackout(1500);
  blackout.classList.add('available');


} else {
  // canvas goes behind HTML
  cnvPosition.style.zIndex = "-1";

  let extra = Math.max(0, inData - threshold);
  blackoutTimer = 2000 + extra * 0.3;   // tweak this

  blackout.classList.remove('available');

  //triggerBlackout(blackoutTimer);
 }

}

/*
  Serial communication
*/
function serialEvent() {
  inData = serial.readLine(); // Use readLine() to read until newline
  
  if (inData && inData.length > 0) {
    // Trim whitespace and convert to number
    let distance = parseInt(inData.trim());
    
    console.log("Distance (mm):", distance);
    
    // Check if sensor is in range
    if (distance > 0) {
      // Use the distance value
      console.log(distance)
    } else {
      console.log("Sensor out of range");
    }
  }
}
/* DON'T TOUCH ME */
function setupSerial() {
  //check for any ports that are available
  serial.getPorts();
  //if there's no port chosen, choose one
  serial.on("noport", makePortButton);
  //open whatever port is available
  serial.on("portavailable", openPort);
  //handle serial errors
  serial.on("requesterror", portError);
  //handle any incoming serial data
  serial.on("data", serialEvent);
  serial.on("close", makePortButton);
  //add serial connect/disconnect listeners
  navigator.serial.addEventListener("connect", portConnect);
  navigator.serial.addEventListener("disconnect", portDisconnect);
}
// if there's no port selected,
// make a port select button appear:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(choosePort);
}
// make the port selector window appear:
function choosePort() {
  if (portButton) portButton.show();
  serial.requestPort();
}
// open the selected port, and make the port button invisible:
function openPort() {
  serial.open({ baudRate: 115200 }).then(initiateSerial); // Match Arduino baud rate!
  
  function initiateSerial() {
    console.log("port open");
  }
  if (portButton) portButton.hide();
}
// pop up an alert if there's a port error:
function portError(err) {

  alert("Serial port error: " + err);
}
// try to connect if a new serial port
// gets added (i.e. plugged in via USB):
function portConnect() {
  console.log("port connected");
  serial.getPorts();
}
// if a port is disconnected:
function portDisconnect() {
  serial.close();
  console.log("port disconnected");
}
function closePort() {
  serial.close();
}
