

export class WaveFormMgr {
   constructor(pointerChangeSub, stateMgr, waveFormPub) {
      const msPerWindow = 4000;
      const msPerBar = 100;
      const barsPerWindow = msPerWindow / msPerBar;
      let locked = false;

      pointerChangeSub(async (inaccurateCurrTime, ignoreTheLock) => {
         if (locked && !ignoreTheLock) {
            console.warn('locked');
            return;
         }
         if (!ignoreTheLock) {
            locked = true;
         }
         let cache;
         try {
            cache = await stateMgr.getCachedAudioBufferInWindow(inaccurateCurrTime - msPerWindow);
         } finally {
            if (!ignoreTheLock) {
               locked = false;
            }
         }
         const audioBuffer = cache.content;
         const actualStartTime = cache.actualStartTime;

         const bufferDurationMs = audioBuffer.duration * 1000;
         let res = [];
         if (audioBuffer) {
            const numBars = bufferDurationMs / msPerBar;
            res = await toWaveForm(audioBuffer, numBars);
         }
         const timeToIdx = time => {
            const idx = (time - actualStartTime) / msPerBar;
            return Math.max(0, idx);
         }
         // Recomputing currTime, because it may have been made accurate
         const currTime = stateMgr.getCurrTime(/* inaccurateCurrTime */ true);
         const leftBarIdx =  timeToIdx(currTime - msPerWindow);
         const middleBarIdx = timeToIdx(currTime);
         const rightBarIdx = timeToIdx(currTime + msPerWindow);
         const resInWindow = pad(res.slice(leftBarIdx, middleBarIdx), barsPerWindow, null, true).concat(pad(res.slice(middleBarIdx, rightBarIdx), barsPerWindow, null));
         waveFormPub(resInWindow);
      });
   }
}

function pad(arr, expectedLen, defaultVal, left) {
   const num = expectedLen - arr.length;
   if (num <= 0) {
      return arr;
   }
   const padding = [];
   for (let idx = 0; idx < num; idx++) {
      padding.push(defaultVal);
   }
   if (left) {
      return padding.concat(arr);
   }
   return arr.concat(padding);
}

async function toWaveForm(audioBuffer, numBars) {
   return normalize(visualize(audioBuffer, numBars));
}

const normalize = filteredData => {
   // const multiplier = Math.pow(Math.max(...filteredData), -1);
   return filteredData.map(n => n * 1.6);
 }

function visualize(audioBuffer, numBars) {
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  const blockSize = Math.floor(rawData.length / numBars); // the number of numBars in each subdivision
  const filteredData = [];
  for (let i = 0; i < numBars; i++) {
   let blockStart = blockSize * i; // the location of the first sample in the block
   filteredData.push(getAvgMagnitude(rawData, blockStart, blockSize));
  }
  return filteredData;
}

function getAvgMagnitude(rawData, blockStart, blockSize) {
   let sum = 0;
   for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the numBars in the block
   }
   return sum / blockSize;
}