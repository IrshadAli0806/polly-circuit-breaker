# Polly Circuit Breaker

A pluggable and configurable Circuit Breaker library for Node.js.

## Installation

```bash
npm install polly-circuit-breaker 
```

## Example with all cases

```bash
const axios = require('axios');
const { CircuitBreaker, LoggingPlugin } = require('./src');
const Sequelize = require('sequelize');
const express = require('express');
const app = express();
const port = 4000;

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

/* Configure Sequelize: Please replace userName, password, hostname and database name with your actual credentials */
const sequelize = new Sequelize({
    username: 'userName',
    password: 'password',
    database: 'dbName',
    host: 'localhost',
    dialect: 'mssql',
    port: '1433',
    dialectOptions: {
      options: {
        encrypt: true, // Use this for Azure SQL
        trustServerCertificate: true, // For self-signed or local development
      },
    },
  });
// console.log(sequelize.config); //Checking SQL configuration log
let failureCount = 0;
async function executeStoredProcedure(mobile) {
    failureCount++;
    if (failureCount <= 3) { // Fail 3 times
        throw new Error('Simulated database error');
    }
    let sqlInlineQuery = ` SELECT * FROM users with(nolock) where mobile=:mobile `;
    const result = await sequelize.query(sqlInlineQuery, {
        replacements: { mobile }
    });
    return result;
}

// Define a route that uses the circuit breaker
app.get('/userdetails', async (req, res) => {
    const { mobile } = req.query;
    try {
        const result = await circuitBreaker.call(() => executeStoredProcedure(mobile));
        const breakerState = circuitBreaker.getState();
        res.send({ result, breakerState });
    } catch (error) {
        const breakerState = circuitBreaker.getState();
        res.status(500).send({message:error.message, breakerState});
    }
});

app.listen(port, () => {
    console.log(Server running on http://localhost:${port});
});