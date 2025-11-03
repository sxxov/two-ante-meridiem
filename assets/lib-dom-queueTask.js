/** Queues a "macro" task, equivalent to `setImmediate` */
export function queueTask(/** @type {() => void} */ callback) {
  const channel = new MessageChannel();
  channel.port1.onmessage = callback;
  channel.port2.postMessage(undefined);

  return () => {
    channel.port1.onmessage = null;
    channel.port1.close();
    channel.port2.close();
  };
}
