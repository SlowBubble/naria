
// Impl follows https://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/

export class AudioRecorder {
  constructor(mimeType, msPerChunk, audioChunkPub, recorderStoppedPub, audioCtx) {
    this._mimeType = mimeType;
    this._msPerChunk = msPerChunk;
    this._audioChunkPub = audioChunkPub;
    // this._recorderStartedPub = recorderStartedPub;
    this._recorderStoppedPub = recorderStoppedPub;
    this._currStream = null;
    this._mediaRecorder = null;
    this._isRecording = false;
    this._audioCtx = audioCtx;
    this._resolveFuncForStop = null;
  }

  async start() {
    this._currStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // create media recorder instance to initialize recording
    const options = {
      audioBitsPerSecond : 64 * 1000,
      mimeType : this._mimeType,
    }
    this._mediaRecorder = new MediaRecorder(this._currStream, options);
    // function to be called when data is received
    this._mediaRecorder.ondataavailable = event => {
      this._audioChunkPub(event.data);
      // if is 'inactive' then recording has finished
      if (this._mediaRecorder.state == 'inactive') {
        if (this._resolveFuncForStop) {
          this._resolveFuncForStop();
          this._resolveFuncForStop = null;
        }
        this._recorderStoppedPub();
      }
    };
    this._mediaRecorder.start(this._msPerChunk);
    this._isRecording = true;
    // this._recorderStartedPub();
  }

  stop() {
    if (this._currStream) {
      this._currStream.getTracks().forEach(track => {
        track.stop();
      });
      this._currStream = null;
    }
    const promiseToStop = new Promise(resolve => {
      this._resolveFuncForStop = resolve;
    });
    if (this._mediaRecorder) {
      this._mediaRecorder.stop();
    }
    this._isRecording = false;
    return promiseToStop;
  }

  isRecording() {
    return this._isRecording;
  }
}

// Usage:
// this._mediaRecorder = new MediaRecorder(filterStream(this._currStream, this._audioCtx), options);
function filterStream(stream, audioCtx) {
  const destination = audioCtx.createMediaStreamDestination();

  const filter = audioCtx.createBiquadFilter();
  filter.Q.value = 1.1;
  filter.frequency.value = 640;
  filter.gain.value = 2.0;
  filter.type = 'bandpass';
  filter.connect(destination);

  const mediaStreamSource = audioCtx.createMediaStreamSource( stream );
  mediaStreamSource.connect( filter );

  return destination.stream;
}
