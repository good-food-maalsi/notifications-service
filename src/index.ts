const express = require("express");

const app = express();

app.get("/", function (req: any, res: any) {
  return res.send("Hello ez ");
});

app.listen(process.env.PORT, function () {
  console.log("Listening on port 8080");
});
