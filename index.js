require('dotenv').config();

const express = require("express");
const app = express();

const bp = require("body-parser");
app.use(bp.json());

const amqp = require("amqplib");
const amqpServer = process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq:5672';
let channel, connection;

// Add root route
app.get("/", (req, res) => {
  res.send("Shipping Service is running");
});

// Connect to RabbitMQ and consume messages
async function connectToQueue() {
    try {
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("order", { durable: false });
        
        console.log("Waiting for orders...");
        
        channel.consume("order", data => {
            try {
                const order = JSON.parse(data.content.toString());
                console.log("Order received:", order);
                console.log("** Will be shipped soon! **\n");
                channel.ack(data);
            } catch (error) {
                console.error("Error processing message:", error);
                channel.nack(data); // Negative acknowledgment for bad messages
            }
        });
    } catch (ex) {
        console.error("Failed to connect to RabbitMQ:", ex);
        // Retry after 5 seconds
        setTimeout(connectToQueue, 5000);
    }
}

// Graceful shutdown
process.once('SIGINT', async () => { 
    console.log('Received SIGINT, closing connection...');
    try {
        if (channel) await channel.close();
        if (connection) await connection.close(); 
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at ${process.env.PORT}`);
    connectToQueue();
});