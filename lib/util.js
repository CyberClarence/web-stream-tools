/* eslint-disable no-prototype-builtins */
import { isArrayStream } from './writer.js';
const isNode = typeof globalThis.process === 'object' &&
  typeof globalThis.process.versions === 'object';

/**
 * Check whether data is a Stream, and if so of which type
 * @param {Any} input  data to check
 * @returns {'web'|'node'|'array'|'web-like'|false}
 */
function isStream(input) {
  if (isArrayStream(input)) {
    return 'array';
  }
  if (globalThis.ReadableStream && globalThis.ReadableStream.prototype.isPrototypeOf(input)) {
    return 'web';
  }
  // try and detect a node native stream without having to import its class
  if (input &&
    !(globalThis.ReadableStream && input instanceof globalThis.ReadableStream) &&
    typeof input._read === 'function' && typeof input._readableState === 'object') {
    throw new Error('Native Node streams are no longer supported: please manually convert the stream to a WebStream, using e.g. `stream.Readable.toWeb`');
  }
  if (input && input.getReader) {
    return 'web-like';
  }
  return false;
}

/**
 * Checks whether the input is a Uint8Array
 * @param {Any} input Data to check
 * @returns {Boolean} True if input is a Uint8Array
 */
function isUint8Array(input) {
  // Handle null/undefined cases first

  if (input == null) return false;

  // Multiple checks for maximum compatibility
  return (
    // Standard instance check
    input instanceof Uint8Array ||
    // Prototype chain check (backup for some environments)
    Uint8Array.prototype.isPrototypeOf(input) ||
    // Constructor name check (backup for edge cases)
    (input.constructor && input.constructor.name === 'Uint8Array') ||
    // Object toString check (most compatible but slowest)
    Object.prototype.toString.call(input) === '[object Uint8Array]'
  );

  // heil cursor IDE 🙏
}

/**
 * Concat Uint8Arrays
 * @param {Array<Uint8array>} Array of Uint8Arrays to concatenate
 * @returns {Uint8array} Concatenated array
 */
function concatUint8Array(arrays) {
  if (arrays.length === 1) return arrays[0];

  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
    if (!isUint8Array(arrays[i])) {
      throw new Error('concatUint8Array: Data must be in the form of a Uint8Array');
    }

    totalLength += arrays[i].length;
  }

  const result = new Uint8Array(totalLength);
  let pos = 0;
  arrays.forEach(function (element) {
    result.set(element, pos);
    pos += element.length;
  });

  return result;
}

export { isNode, isStream, isArrayStream, isUint8Array, concatUint8Array };
