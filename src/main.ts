import './style.css'


// Useful UI elements
const playButton = document.querySelector("#playButton");
const volumeControl = document.querySelector("#volumeControl");

// The audio context and the node will be initialized after the first request
let context = null;
let oscNode1 = null;
let oscNode2 = null;
let oscNode3 = null;
let constantNode = null;
let gainNode1 = null;
let gainNode2 = null;
let gainNode3 = null;
function setup() {
  context = new AudioContext();

  gainNode1 = new GainNode(context, {
    gain: 0.5,
  });
  gainNode2 = new GainNode(context, {
    gain: gainNode1.gain.value,
  });
  gainNode3 = new GainNode(context, {
    gain: gainNode1.gain.value,
  });

  volumeControl.value = gainNode1.gain.value;

  constantNode = new ConstantSourceNode(context, {
    offset: volumeControl.value,
  });
  constantNode.connect(gainNode2.gain);
  constantNode.connect(gainNode3.gain);
  constantNode.start();

  gainNode1.connect(context.destination);
  gainNode2.connect(context.destination);
  gainNode3.connect(context.destination);

  // All is set up. We can hook the volume control.
  volumeControl.addEventListener("input", changeVolume);
}
playButton.addEventListener("change", togglePlay);
function togglePlay(event) {
  if (!playButton.checked) {
    stopOscillators();
  } else {
    // If it is the first start, initialize the audio graph
    if (!context) {
      setup();
    }
    startOscillators();
  }
}
function changeVolume(event) {
  constantNode.offset.value = volumeControl.value;
}
function startOscillators() {
  oscNode1 = new OscillatorNode(context, {
    type: "sine",
    frequency: 261.6255653005986, // middle C
  });
  oscNode1.connect(gainNode1);

  oscNode2 = new OscillatorNode(context, {
    type: "sine",
    frequency: 329.6275569128699, // E
  });
  oscNode2.connect(gainNode2);

  oscNode3 = new OscillatorNode(context, {
    type: "sine",
    frequency: 391.99543598174927, // G
  });
  oscNode3.connect(gainNode3);

  oscNode1.start();
  oscNode2.start();
  oscNode3.start();
}
function stopOscillators() {
  oscNode1.stop();
  oscNode2.stop();
  oscNode3.stop();
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="loading">
<map name="range-overlay">
  <area
    shape="circle"
    coords="75,75,75"
    href="left.html"
    alt="Click to go Left" />
  <area
    shape="circle"
    coords="275,75,75"
    href="right.html"
    alt="Click to go Right" />
</map>
  <div>
  <button id="screenshot" type="button">Save...</button>
    <div>
      <canvas id="uu" tabindex="0"></canvas>
      <canvas id="uk" tabindex="1"></canvas>
      <canvas id="ku" tabindex="2"></canvas>
      <canvas id="kk" tabindex="3"></canvas>
    </div>
  </div>
  <img
    usemap="#range-overlay"
    src="https://dummyimage.com/350x150"
    alt="350 x 150 pic" />
</div>
<div class="controls">
  <input type="checkbox" id="playButton" />
  <label for="playButton">Activate: </label>
  <label for="volumeControl">Volume: </label>
  <input
    type="range"
    min="0.0"
    max="1.0"
    step="0.01"
    value="0.8"
    name="volume"
    id="volumeControl" />
</div>

<p>
  Toggle the checkbox above to start and stop the tones, and use the volume
  control to change the volume of the notes E and G in the chord.
</p>
`