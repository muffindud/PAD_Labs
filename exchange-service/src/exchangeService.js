const express = require("express");
const axios = require("axios");
const exchangeRoutes = require("./routes/exchange");
const os = require("os");

const app = express();
const port = process.env.PORT || 3000;
const serviceDiscoveryUrl = `http://${process.env.SERVICE_DISCOVERY_HOST}:${process.env.SERVICE_DISCOVERY_PORT}/discovery`;
const serviceId = fetch(
  serviceDiscoveryUrl,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_name: "Exchange Service",
      host: os.hostname(),
      port: port.toString(),
    }),
  }
)
  .then((response) => response.json())
  .then((data) => data.id)
  .catch((error) => {
    console.error("Error registering service with service discovery", error);
    process.exit(1);
  })
  .finally(() => {

    app.use(express.json());

    app.use((req, res, next) => {
      console.log(`${req.ip} - - [${new Date().toUTCString()}] "${req.method} ${req.path} HTTP/1.1" ${res.statusCode} - "${req.headers['user-agent']}"`);
      // console.log("Headers: ", req.headers);
      // console.log("Body: ", req.body);
      next();
    })

    app.use("/api", exchangeRoutes);

    app.get("/", (req, res) => {
      res.send("Welcome to the Exchange Service!");
    });

    app.get("/health", (req, res) => {
      res.status(200).json({ status: "healthy" });
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something went wrong!");
    });

    // const healthCheck = async () => {
    //   console.log("Performing health check...");

    //   try {
    //     const response = await axios.get(`http://localhost:${port}/api/status`);
    //     if (response.status === 200) {
    //       console.log("Service is healthy (status endpoint reachable)");
    //     }
    //   } catch (error) {
    //     console.error(
    //       "Health check failed: Service is down or unreachable",
    //       error.message
    //     );
    //   }
    // };

    // setInterval(healthCheck, 10000);

    app.listen(port, () => {
      console.log(`Exchange Service listening at http://localhost:${port}`);
    });

});