// File: src/plugins/loggingPlugin.js
class LoggingPlugin {
    onOpen() {
        console.log('Circuit opened');
    }

    onHalfOpen() {
        console.log('Circuit half-open');
    }

    onClose() {
        console.log('Circuit closed');
    }

    onSuccess() {
        console.log('Action succeeded');
    }

    onFailure() {
        console.log('Action failed');
    }
}

module.exports = LoggingPlugin;
