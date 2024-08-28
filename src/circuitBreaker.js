// File: src/circuitBreaker.js
class CircuitBreaker {
    constructor(config = {}) {
        this.failureThreshold = config.failureThreshold || 3;
        this.successThreshold = config.successThreshold || 1;
        this.timeout = config.timeout || 5000;
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.plugins = config.plugins || [];
    }

    async call(action) {
        if (this.state === 'OPEN') {
            throw new Error('Circuit is currently open');
        }

        try {
            const result = await Promise.race([
                action(),
                this._timeout()
            ]);
            this._onSuccess();
            return result;
        } catch (error) {
            this._onFailure();
            throw error;
        }
    }

    _onSuccess() {
        this.successes += 1;
        this.failures = 0;

        if (this.state === 'HALF-OPEN' && this.successes >= this.successThreshold) {
            this._close();
        }

        this._executePlugins('onSuccess');
    }

    _onFailure() {
        this.failures += 1;

        if (this.failures >= this.failureThreshold) {
            this._open();
        } else {
            this._executePlugins('onFailure');
        }
    }

    _open() {
        this.state = 'OPEN';
        setTimeout(() => this._halfOpen(), this.timeout);
        this._executePlugins('onOpen');
    }

    _halfOpen() {
        this.state = 'HALF-OPEN';
        this.successes = 0;
        this._executePlugins('onHalfOpen');
    }

    _close() {
        this.state = 'CLOSED';
        this.failures = 0;
        this._executePlugins('onClose');
    }

    _timeout() {
        return new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), this.timeout)
        );
    }

    _executePlugins(hook) {
        this.plugins.forEach(plugin => {
            if (typeof plugin[hook] === 'function') {
                plugin[hook]();
            }
        });
    }
}

module.exports = CircuitBreaker;
