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
  res.send("Order Service is running");
});

// Connect to RabbitMQ
async function connectToQueue() {
    try {
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("order", { durable: false });
        console.log("Connected to the queue!");
    } catch (ex) {
        console.error("Failed to connect to RabbitMQ:", ex);
        // Retry after 5 seconds
        setTimeout(connectToQueue, 5000);
    }
}

// Modified order endpoint to accept direct order object
app.post("/order", (req, res) => {
    try {
        const order = req.body; // Get the entire body as order
        if (!order || Object.keys(order).length === 0) {
            return res.status(400).json({ error: "Order data is required" });
        }
        
        createOrder(order);
        res.status(201).json({ 
            message: "Order created successfully",
            order: order 
        });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const createOrder = async (order) => {
    try {
        if (!channel) {
            throw new Error("No RabbitMQ channel available");
        }
        
        await channel.sendToQueue(
            "order", 
            Buffer.from(JSON.stringify(order)),
            { persistent: true }
        );
        console.log("Order successfully created:", order);
    } catch (error) {
        console.error("Failed to create order:", error);
    }
};

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