import {RecordStateMgr} from './audio/manageState.js';
import * as pubSub from './utils/pubSub.js'
import * as banner from './utils/banner.js';
import { KeyboardShortcuts } from './keyboardShortcuts.js';
import { ActionMgr } from './actionMgr.js';
import { WaveFormDrawer } from './audio/drawWaveForm.js';
import { WaveFormMgr } from './audio/computeWaveForm.js';
import { MouseShortcuts } from './mouseShortcuts.js';


window.onload = _ => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext({sampleRate: 44100});
  const [waveFormPub, waveFormSub] = pubSub.make();
  const [pointerChangePub, pointerChangeSub] = pubSub.make();
  const [recorderStoppedPub, recorderStoppedSub] = pubSub.make();
  const [audioChunkPub, audioChunkSub] = pubSub.make();

  const microphoneRecordingsHtml = document.getElementById('microphone-recordings');
  const stateMgr = new RecordStateMgr(
    audioCtx, pointerChangePub, recorderStoppedPub, recorderStoppedSub,
    audioChunkPub, audioChunkSub,
    microphoneRecordingsHtml);
  const eBanner = banner.setup();
  const actionMgr = new ActionMgr(eBanner, stateMgr);
  new KeyboardShortcuts(actionMgr);
  new MouseShortcuts(actionMgr);

  new WaveFormMgr(pointerChangeSub, stateMgr, waveFormPub);
  new WaveFormDrawer(waveFormSub, document.getElementById('left-wave-form-canvas'), document.getElementById('right-wave-form-canvas'));

  const fileInput = document.getElementById('audio-file-input');
  fileInput.onchange = _ => {
    if (fileInput.files.length < 1) {
      return;
    }
    const blob = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    audioChunkPub(blob);
    // const bytesPerMs = 8;
    // const msPerChunk = 200;
    // const bytesPerChunk = bytesPerMs * msPerChunk;
    // const numChunks = Math.ceil(blob.size / bytesPerChunk);
    // for (let chunkIdx = 0; chunkIdx < numChunks; chunkIdx++) {
    //   audioChunkPub(blob.slice(chunkIdx * bytesPerChunk, (chunkIdx + 1) * bytesPerChunk));
    // }
    reader.addEventListener("load", function () {
      // convert image file to base64 string
      console.log(reader.result);
    }, false);
  };

  // const microphoneButton = document.getElementById('microphone-record');
  // recorder.setup(microphoneRecordingsHtml, microphoneButton);
};

// function onDecode({left, right, samplesDecoded, sampleRate}) {
//   console.log(`Decoded ${samplesDecoded} samples`);
//   // play back the left/right audio, write to a file, etc
// }




