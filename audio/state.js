
export class RecordState {
  constructor(audioChunkSub, chunkRecordedPub) {
    this._chunks = [];
    this._setupSub(audioChunkSub, chunkRecordedPub);
  }

  getChunks() {
    return this._chunks;
  }

  setChunks(chunks) {
    this._chunks = chunks;
  }

  _setupSub(audioChunkSub, chunkRecordedPub) {
    audioChunkSub(chunk => {
      this._chunks.push(chunk);
      chunkRecordedPub(this._chunks);
    });
  }

}