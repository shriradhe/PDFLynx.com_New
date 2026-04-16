const { io } = require('../server');

const emitProgress = (roomId, data) => {
  if (io) {
    io.to(roomId).emit('progress', data);
  }
};

const emitComplete = (roomId, data) => {
  if (io) {
    io.to(roomId).emit('complete', data);
  }
};

const emitError = (roomId, data) => {
  if (io) {
    io.to(roomId).emit('error', data);
  }
};

module.exports = { emitProgress, emitComplete, emitError };
