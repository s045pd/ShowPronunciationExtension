// Mock chrome API
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

// Mock window object
global.window = Object.create(window); 