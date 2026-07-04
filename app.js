const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("NodeJS DevOps Demo Application");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});
