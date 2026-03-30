/**
 * Global Chrome Extension API mock — runs via Jest setupFiles
 * (before test framework globals are available, so no beforeEach here).
 * clearMocks: true in jest config resets jest.fn() call counts between tests.
 * Storage state is reset manually in each test file via chrome.storage.local._reset().
 */

let _store = {};

const storageMock = {
  local: {
    get: jest.fn((keys) => {
      const result = {};
      const keyList = Array.isArray(keys)
        ? keys
        : typeof keys === 'string'
          ? [keys]
          : Object.keys(keys);
      keyList.forEach((k) => { if (k in _store) result[k] = _store[k]; });
      return Promise.resolve(result);
    }),
    set: jest.fn((items) => {
      Object.assign(_store, items);
      return Promise.resolve();
    }),
    remove: jest.fn((keys) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach((k) => delete _store[k]);
      return Promise.resolve();
    }),
    clear: jest.fn(() => { _store = {}; return Promise.resolve(); }),
    // Test helper — reset backing store without needing beforeEach in setup.js
    _reset: () => { _store = {}; },
  },
};

const alarmsMock = {
  create: jest.fn(),
  clear: jest.fn(),
  onAlarm: { addListener: jest.fn() },
};

const runtimeMock = {
  onInstalled: { addListener: jest.fn() },
  onMessage:   { addListener: jest.fn() },
  sendMessage:  jest.fn(),
  id: 'test-extension-id',
};

global.chrome = {
  storage: storageMock,
  alarms:  alarmsMock,
  runtime: runtimeMock,
};
