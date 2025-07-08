const { randomFillSync } = require('crypto');

const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;

// a ??= b 写法在某些旧版 node 里会报错，这里兼容一下
function doubleq(left, right) {
  if (left === null || left === undefined) {
    return right;
  }
  return left;
}

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

const _state = {};
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]).toLowerCase();
}

function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
  if (rnds.length < 16) {
    throw new Error('Random bytes length must be >= 16');
  }
  if (!buf) {
    buf = new Uint8Array(16);
    offset = 0;
  }
  else {
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
  }
  msecs = doubleq(msecs, Date.now());
  seq = doubleq(seq, ((rnds[6] * 0x7f) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9]);
  // msecs ??= Date.now();
  // seq ??= ((rnds[6] * 0x7f) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
  buf[offset++] = (msecs / 0x10000000000) & 0xff;
  buf[offset++] = (msecs / 0x100000000) & 0xff;
  buf[offset++] = (msecs / 0x1000000) & 0xff;
  buf[offset++] = (msecs / 0x10000) & 0xff;
  buf[offset++] = (msecs / 0x100) & 0xff;
  buf[offset++] = msecs & 0xff;
  buf[offset++] = 0x70 | ((seq >>> 28) & 0x0f);
  buf[offset++] = (seq >>> 20) & 0xff;
  buf[offset++] = 0x80 | ((seq >>> 14) & 0x3f);
  buf[offset++] = (seq >>> 6) & 0xff;
  buf[offset++] = ((seq << 2) & 0xff) | (rnds[10] & 0x03);
  buf[offset++] = rnds[11];
  buf[offset++] = rnds[12];
  buf[offset++] = rnds[13];
  buf[offset++] = rnds[14];
  buf[offset++] = rnds[15];
  return buf;
}

function updateV7State(state, now, rnds) {
  state.msecs = doubleq(state.msecs, -Infinity);
  state.seq = doubleq(state.seq, 0);
  // state.msecs ??= -Infinity;
  // state.seq ??= 0;
  if (now > state.msecs) {
    state.seq = (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
    state.msecs = now;
  }
  else {
    state.seq = (state.seq + 1) | 0;
    if (state.seq === 0) {
      state.msecs++;
    }
  }
  return state;
}

function v7(options, buf, offset) {
  let bytes;
  if (options) {
    bytes = v7Bytes(options.random ?? options.rng?.() ?? rng(), options.msecs, options.seq, buf, offset);
  }
  else {
    const now = Date.now();
    const rnds = rng();
    updateV7State(_state, now, rnds);
    bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
  }
  return buf ?? unsafeStringify(bytes);
}

exports.v7 = v7;
