const delayToNotRecordKeyboardNoise = 400;

export class ActionMgr {
  constructor(eBanner, stateMgr) {
    this._eBanner = eBanner;
    this._stateMgr = stateMgr;
  }

  // Should stop any recording and play from the start of the newest recording.
  async pauseOrResumeReplay() {
    if (this._stateMgr.isRecording()) {
      await this.pauseRecording();
      this.goToPrevStart();
      this._stateMgr.startReplaying();
      return;
    }
    if (this._stateMgr.isReplaying()) {
      this._stateMgr.pauseReplaying();
      return;
    }
    this._stateMgr.startReplaying();
  }

  pauseOrResumeRecording() {
    if (this._stateMgr.isRecording()) {
      this.pauseRecording();
    } else {
      this.resumeRecording(delayToNotRecordKeyboardNoise, /* enforceDuration */ true);
    }
  }

  async pauseRecording() {
    await this._stateMgr.stopRecording();
    this.shift(-delayToNotRecordKeyboardNoise);
    await this._stateMgr.trimRight();
  }

  resumeRecording(duration, enforceDuration) {
    if (!enforceDuration) {
      duration = Math.min(this._stateMgr.getTimeLength(), duration);
    }
    for (let idx = 1; idx <= 3; idx++) {
      if (duration >= idx * 1000) {
        window.setTimeout(_ => {
          this._eBanner.inProgress(`${idx}`);
        }, duration - idx * 1000);
      }
    }
    window.setTimeout(_ => {
      this._eBanner.success('Recording.');
      this._stateMgr.startRecording();
    }, duration);
  }

  goToDecimal(decimal) {
    this._stateMgr.setCurrTime(this._stateMgr.getTimeLength() * decimal / 10);
  }
  goToNextStart() {
    this._stateMgr.goToNextStart();
  }

  goToPrevStart() {
    this._stateMgr.goToPrevStart();
  }

  shift(timeMs) {
    this._stateMgr.setCurrTime(this._stateMgr.getCurrTime() + timeMs);
  }

  trimRight() {
    this._stateMgr.trimRight();
  }

  download() {
    const link = document.getElementById('download-link');
    if (!link) {
      return;
    }
    const name = prompt('Name');
    if (!name) {
      return;
    }
    link.download = `${name}.webm`;
    link.click();
  }
}