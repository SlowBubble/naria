
const timePubIntervalMs = 100;

export class Replayer {
  constructor(audioCtx, replayerTimePub) {
    this._audioCtx = audioCtx;
    this._audioBuffer = null;
    this._sourceNode = null;
    this._currTimeMs = 0;
    this._startTimeMs = 0;
    this._isPlaying = false;
    // This is needed because this._sourceNode.onended cannot distinguish between pausing vs naturally ending.
    this._endedNaturally = true;
    this._replayerTimePub = replayerTimePub;
    this._timePubIntervalHandle = null;
  }

  reload(audioBuffer) {
    this._audioBuffer = audioBuffer;
  }

  play(timeMs) {
    if (!this._audioBuffer || this._isPlaying) {
      return;
    }
    // This is not the current time when it's playing.
    // Call getCurrTimeMs to get the current time.
    this._currTimeMs = timeMs || 0;

    this._loadSourceNode();
    this._sourceNode.start(/* when */ 0, /* offset */ this._currTimeMs / 1000);

    this._startTimeMs = Date.now();
    this._isPlaying = true;
    this._endedNaturally = true;
    this._timePubIntervalHandle = window.setInterval(_ => {
      this._replayerTimePub(this.getCurrTimeMs());
    }, timePubIntervalMs);
  }

  getCurrTimeMs() {
    if (!this.isPlaying()) {
      return this._currTimeMs;
    }
    const elapsedTimeMs = Date.now() - this._startTimeMs;
    return this._currTimeMs + elapsedTimeMs;
  }

  _setCurrTimeMs(currTimeMs) {
    this._currTimeMs = currTimeMs;
  }

  pause() {
    if (!this._sourceNode || !this._isPlaying) {
      return;
    }
    this._endedNaturally = false;
    this._sourceNode.stop();
  }

  isPlaying() {
    return this._isPlaying;
  }

  _loadSourceNode() {
    this._sourceNode = this._audioCtx.createBufferSource();
    this._sourceNode.buffer = this._audioBuffer;
    this._sourceNode.connect(this._audioCtx.destination);
    this._sourceNode.onended = evt => {
      this._cleanUpOnPause(this.getCurrTimeMs());
    };
  }

  _cleanUpOnPause(currTimeMs) {
    this._setCurrTimeMs(currTimeMs);
    window.clearInterval(this._timePubIntervalHandle);
    this._isPlaying = false;
    this._replayerTimePub(currTimeMs, this._endedNaturally);
    this._startTimeMs = 0;
  }
}