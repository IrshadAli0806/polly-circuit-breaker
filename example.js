const { CircuitBreaker, LoggingPlugin } = require('polly-circuit-breaker');
const axios = require('axios');

const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 3000,
    plugins: [new LoggingPlugin()],
});

async function fetchData() {
    const apiCall = async () => {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        return response.data;
    };

    try {
        const result = await circuitBreaker.call(apiCall);
        console.log('API Response:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchData();
