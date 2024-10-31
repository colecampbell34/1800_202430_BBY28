
const express = require("express");
const app = express();
const path = require('path');
const fs = require("fs");

app.use("/scripts", express.static("./public/scripts"));
app.use("/styles", express.static("./public/styles"));
app.use("/images", express.static("./public/images"));
app.use("/skeleton", express.static("./public/skeleton"))
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    let doc = fs.readFileSync("./public/index.html", "utf8");
    res.send(doc);
});


// for page not found (i.e., 404)
app.use(function (req, res, next) {
    // this could be a separate file too - but you'd have to make sure that you have the path
    // correct, otherewise, you'd get a 404 on the 404 (actually a 500 on the 404)
    res.status(404).send("<html><head><title>Page not found!</title></head><body><p>Nothing here.</p></body></html>");
});


// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log("Example app listening on port " + port + "!");
});