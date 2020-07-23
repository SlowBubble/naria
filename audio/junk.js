         // const missingVal = null;
         // const leftAudioBuf = await stateMgr.getAudioBuffer(currTime - msPerWindow, currTime);
         // const leftDuration = stateMgr._getChunks(currTime - msPerWindow, currTime).length * stateMgr._msPerChunk;
         // const leftNumBars = Math.floor(leftDuration / msPerBar);
         // // leftAudioBuf.duration is not accurate when we insert a magic header chunk.
         // // const leftNumBars = Math.floor(leftAudioBuf.duration * 1000 / msPerBar);
         // const leftRes = await toWaveForm(leftAudioBuf, leftNumBars);
         // const leftPaddedRes = pad(leftRes, barsPerWindow, missingVal, true);

         // let rightRes = [];
         // if (!stateMgr.isRecording()) {
         //    const rightAudioBuf = await stateMgr.getAudioBuffer(currTime, currTime + msPerWindow);
         //    const rightDuration = stateMgr._getChunks(currTime - msPerWindow, currTime).length * stateMgr._msPerChunk;
         //    const rightNumBars = Math.floor(rightDuration / msPerBar);
         //    rightRes = await toWaveForm(rightAudioBuf, rightNumBars);
         // }
         // const rightPaddedRes = pad(rightRes, barsPerWindow, missingVal, false);
         // waveFormPub(leftPaddedRes.concat(rightPaddedRes));

         function dataURItoBlob(dataURI) {
          // convert base64 to raw binary data held in a string
          // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
          var byteString = atob(dataURI.split(',')[1]);
        
          // separate out the mime component
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
        
          // write the bytes of the string to an ArrayBuffer
          var ab = new ArrayBuffer(byteString.length);
        
          // create a view into the buffer
          var ia = new Uint8Array(ab);
        
          // set the bytes of the buffer to the correct values
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }
        
          // write the ArrayBuffer to a blob, and you're done
          var blob = new Blob([ab], {type: mimeString});
          return blob;
        
        }

        
export function setup(microphoneRecordingsHtml, microphoneButton, decoder) {

  // Current states.
  let currStream = null;
  let recorder = null;

  const stopRecording = _ => {
    if (currStream) {
      currStream.getTracks().forEach(track => {
        track.stop();
      });
      currStream = null;
    }
    if (recorder) {
      recorder.stop();
    }
    microphoneButton.textContent = 'Start Microphone';
    microphoneButton.style.backgroundColor = '';
  };

  const startRecording = stream => {
    currStream = stream;
    microphoneButton.textContent = 'Stop Microphone';
    microphoneButton.style.backgroundColor = 'red';

    // store streaming data chunks in array
    const chunks = [];
    // create media recorder instance to initialize recording
    const mimeType = 'audio/webm;codecs=opus';
    const options = {
      audioBitsPerSecond : 64 * 1000,
      mimeType : mimeType,
    }
    recorder = new MediaRecorder(stream, options);
    // function to be called when data is received
    recorder.ondataavailable = event => {
      // add stream data to chunks
      // decoder.ready.then(async _ => {
      //   const buffer = await event.data.arrayBuffer();
      //   var uint8View = new Uint8Array(buffer);
      //   decoder.decode(uint8View);
      //   decoder.free();
      // });
      chunks.push(event.data);
      // if recorder is 'inactive' then recording has finished
      if (recorder.state == 'inactive') {
          // convert stream data chunks to a 'webm' audio format as a blob
          const processedChunks = [chunks[0], chunks[1]];
          const blob = new Blob(processedChunks, { type: mimeType });
          inspectBlob(blob)
          // convert blob to URL so it can be assigned to a audio src attribute
          createAudioElement(URL.createObjectURL(blob), microphoneRecordingsHtml);
      }
    };
    const msPerChunk = 200
    recorder.start(msPerChunk);
  };

  microphoneButton.onclick = _ => {
    if (currStream) {
      stopRecording();
      return;
    }
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    }).then(startRecording);
  }
}

const audioContext = new AudioContext();
async function inspectBlob(blob) {
  const buffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  console.log(visualize(audioBuffer));
}

function visualize(audioBuffer) {
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  const samples = 20; // Number of samples we want to have in our final data set
  const blockSize = Math.floor(rawData.length / samples); // Number of samples in each subdivision
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    filteredData.push(rawData[i * blockSize]); 
  }
  return filteredData;
}

// appends an audio element to playback and download recording
function createAudioElement(blobUrl, microphoneRecordingsHtml) {
  const downloadEl = document.createElement('a');
  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  const sourceEl = document.createElement('source');
  sourceEl.src = blobUrl;
  sourceEl.type = 'audio/webm';
  audioEl.appendChild(sourceEl);
  microphoneRecordingsHtml.appendChild(audioEl);

  // No need for download link because it appears in the audio overflow menu after hitting play.
  // downloadEl.style = 'display: block';
  // downloadEl.innerHTML = 'Download microphone recording';
  // downloadEl.download = 'audio.webm';
  // downloadEl.href = blobUrl;
  // microphoneRecordingsHtml.appendChild(downloadEl);
}

// https://developers.google.com/web/fundamentals/media/recording-audio
// const context = new AudioContext();
// const source = context.createMediaStreamSource(stream);
// const processor = context.createScriptProcessor(1024, 1, 1);

// source.connect(processor);
// processor.connect(context.destination);

// processor.onaudioprocess = function(e) {
//   // Do something with the data, e.g. convert it to WAV
//   console.log(e.inputBuffer);
// };