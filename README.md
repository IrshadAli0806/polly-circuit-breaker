# Polly Circuit Breaker

A pluggable and configurable Circuit Breaker library for Node.js.

## Installation

```bash
npm install polly-circuit-breaker

# Example with all cases

```bash
const axios = require('axios');
const { CircuitBreaker, LoggingPlugin } = require('./src');

// Configure the Circuit Breaker
const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 3000,
    plugins: [new LoggingPlugin()],
});

// Function to call a REST API
async function fetchPost(id) {
    const apiCall = async () => {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
        return response.data;
    };

    try {
        const result = await circuitBreaker.call(apiCall);
        console.log('API Response:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Testing the Circuit Breaker with a REST API
(async () => {
    console.log('Calling a healthy API...');
    await fetchPost(1); // Should succeed

    console.log('Simulating API failures...');
    for (let i = 0; i < 4; i++) {
        await fetchPost(99999); // Should fail and eventually open the circuit
    }

    console.log('Testing recovery...');
    setTimeout(async () => {
        await fetchPost(1); // After timeout, should succeed and close the circuit
    }, 4000);
})();

