
const goBackDuration = 4000;

export class KeyboardShortcuts {
  constructor(actionMgr) {
    _hotkeys(`space`, _ => {
      actionMgr.pauseOrResumeReplay();
    });
    _hotkeys(`shift+space`, _ => {
      actionMgr.shift(-goBackDuration)
      actionMgr.pauseOrResumeReplay();
    });
    _hotkeys(`enter`, _ => {
      actionMgr.pauseOrResumeRecording();
    });
    _hotkeys(`\\`, _ => {
      actionMgr.trimRight();
      window.setTimeout(_ => {
        actionMgr.shift(-goBackDuration);
        actionMgr.pauseOrResumeReplay();
        actionMgr.resumeRecording(goBackDuration);
      }, 200);
    });
    _hotkeys(`left`, _ => {
      actionMgr.shift(-200);
    });
    _hotkeys(`right`, _ => {
      actionMgr.shift(200);
    });
    _hotkeys(`0,1,2,3,4,5,6,7,8,9`, (_, hotkeysHandler) => {
      actionMgr.goToDecimal(parseInt(hotkeysHandler.key));
    });
    _hotkeys(`n`, _ => {
      actionMgr.goToNextStart();
    });
    _hotkeys(`p`, _ => {
      actionMgr.goToPrevStart();
    });
    _hotkeys(`backspace`, _ => {
      actionMgr.trimRight();
      // actionMgr.removeNoise();
    });
    _hotkeys(`${cmdKeyString()}+s`, _ => {
      actionMgr.download();
    });
    // _hotkeys(`d`, _ => {
    //   actionMgr.denoise();
    // });
  }
}

function _hotkeys(shortcut, handler) {
  hotkeys(shortcut, (evt, hotkeysHandler) => {
    evt.preventDefault();
    handler(evt, hotkeysHandler);
  })
}

function isMac() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

function isCros() {
  return /\bCrOS\b/.test(navigator.userAgent);
}

function cmdKey() {
  if (isMac()) {
    return 'metaKey';
  }
  return 'ctrlKey';
}

function cmdKeyString() {
  if (isMac()) {
    return 'command';
  }
  return 'ctrl';
}