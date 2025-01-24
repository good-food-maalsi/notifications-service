const express = require("express");

const app = express();

app.get("/notifications", function (req: any, res: any) {
  return res.send("Hello ez ");
});
app.get("/notifications/test", function (req: any, res: any) {
  return res.send("TEST TEST TEST TEST");
});

app.listen(process.env.PORT, function () {
  console.log("Listening on port 8080");
});
