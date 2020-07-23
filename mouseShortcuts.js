
export class MouseShortcuts {
  constructor(actionMgr) {

    // document.getElementById('microphone-recordings');
    document.getElementById('microphone-record').onclick = _ => {
      actionMgr.pauseOrResumeRecording();
    }
  }
}