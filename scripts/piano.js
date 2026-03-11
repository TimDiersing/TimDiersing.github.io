const piano = document.getElementsByClassName("piano")[0];
let mainGainNode = null;
const octiveMult = 1;

// starts with middle c
const notesList = [
    { key: "C", freq: 261.625565, osc: null },
    { key: "C#", freq: 277.1826, osc: null },
    { key: "D", freq: 293.6648, osc: null },
    { key: "D#", freq: 311.1270, osc: null },
    { key: "E", freq: 329.6276, osc: null },
    { key: "F", freq: 349.2282, osc: null },
    { key: "F#", freq: 369.9944, osc: null },
    { key: "G", freq: 391.9954, osc: null },
    { key: "G#", freq: 415.3047, osc: null },
    { key: "A", freq: 440.0000, osc: null },
    { key: "A#", freq: 466.1638, osc: null },
    { key: "B", freq: 493.8833, osc: null },
];

const keysList = [];

function setupPiano()
{
    mainGainNode = audioCtx.createGain();
    mainGainNode.gain.value = 0.2;
    mainGainNode.connect(audioCtx.destination);

    SpawnKeys();

}

// Spawn one octave starting with middle C
function SpawnKeys()
{
    let keyWidth = 60.5;
    const padding = 0;
    let blackPos = keyWidth * -0.25 + padding;

    for (let i = 0; i < notesList.length; i++)
    {
        const noteInfo = notesList[i];
        const key = document.createElement("div");
        key.draggable = false;
        key.addEventListener("dragstart", (e) => e.preventDefault());

        if (noteInfo.key.length > 1) { // sharp note so black key
            key.classList.add("black-key");
            piano.appendChild(key);
            key.style.left = `${blackPos}px`;
        } 
        else { // white key
            key.classList.add("white-key");
            piano.appendChild(key);

            blackPos += keyWidth;
        }

        key.addEventListener("mousedown", () => {startNote(noteInfo.key)});
        key.addEventListener("mouseup", () => {stopNote(noteInfo.key)});
        key.addEventListener("mouseenter", (e) => {
            if (e.buttons && 1 !== 0) {
                startNote(noteInfo.key)
            }
        });
        key.addEventListener("mouseleave", () => {stopNote(noteInfo.key)});
    }
}

function startNote(key)
{
    const noteInfo = notesList.find(x => x.key === key);
    if (noteInfo === null || noteInfo.osc != null) {
        return;
    }

    console.log(`start note ${key}`);

    const osc = audioCtx.createOscillator();

    osc.connect(mainGainNode);
    osc.type = 'sawtooth';
    osc.frequency.value = noteInfo.freq * octiveMult;

    osc.start();
    noteInfo.osc = osc;
}

function stopNote(key)
{
    const noteInfo = notesList.find(x => x.key === key);

    if (noteInfo.osc !== null)
    {
        console.log(`stop note ${key}`);
        noteInfo.osc.stop();
        noteInfo.osc = null;
    }
}