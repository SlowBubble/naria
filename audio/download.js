
export class Downloader {
  constructor(microphoneRecordingsHtml) {
    this._microphoneRecordingsHtml = microphoneRecordingsHtml;
    this._currUrl = null;
  }

  reload(blob) {
    // convert blob to URL so it can be assigned to a audio src attribute
    const oldUrl = this._currUrl;
    this._currUrl = URL.createObjectURL(blob);
    createAudioElement(this._currUrl, this._microphoneRecordingsHtml);
    // Wait a little before removing old url to avoid net::ERR_FILE_NOT_FOUND.
    window.setTimeout(_ => {
      URL.revokeObjectURL(oldUrl);
    }, 1000);
  }
}

// appends an audio element to playback and download recording
function createAudioElement(blobUrl, microphoneRecordingsHtml) {
  while (microphoneRecordingsHtml.firstChild) {
    microphoneRecordingsHtml.removeChild(microphoneRecordingsHtml.firstChild);
  }

  // const audioEl = document.createElement('audio');
  // audioEl.controls = true;
  // const sourceEl = document.createElement('source');
  // sourceEl.src = blobUrl;
  // sourceEl.type = 'audio/webm';
  // audioEl.appendChild(sourceEl);
  // microphoneRecordingsHtml.appendChild(audioEl);
  
  // No need for download link because it appears in the audio overflow menu after hitting play.
  const downloadEl = document.createElement('a');
  downloadEl.id = 'download-link';
  downloadEl.style = 'display: block';
  downloadEl.innerHTML = 'Download microphone recording (cmd+s)';
  downloadEl.download = 'audio.webm';
  downloadEl.href = blobUrl;
  microphoneRecordingsHtml.appendChild(downloadEl);
}