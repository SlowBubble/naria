/**
 * Usage:
    const [noteOnPub, noteOnSub] = pubsub.make();
    noteOnSub(data => { console.log('Received', data); });
    noteOnPub(42);
 *   
 *   
 */

export const make = () => {
  const evtMgr = new EvtMgr;
  return [evtMgr.pub, evtMgr.sub];
}

class EvtMgr {
  constructor() {
    this.handlers = [];

    // This weird way of defining methods is needed to support
    // the usage of passing EvtMgr.pub instead of EvtMgr into
    // other callers, so that this.handlers is defined.
    this.pub = (...args) => {
      this.handlers.forEach(handler => {
        handler(...args);
      });
    }
    this.sub = handler => {
      if (typeof handler !== "function") {
        throw "handler must be a funtion";
      }
      this.handlers.push(handler);
    };
  }
}
