const http = require("http");
const host = 'localhost';
const port = 8000;
var qs = require('querystring');
var tiku = {}
var last_saved = "";



const fs = require('fs')
const requestListener = function (req, res) {



    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;

        });

        req.on('end', function () {
            var post = qs.parse(body);
            var q =post.key
            var ans = post.ans
            var action = post.action

            if (action =='save') {
                console.log("============================");
                console.log("saved successfully");
                console.log("============================");

                if (tiku.hasOwnProperty(q)){

                    console.log("----------------------------------");
                    console.log("replace question:");
                    console.log("----------------------------------");
                    console.log(q);
                    console.log("----------------------------------");
                    console.log(tiku[q]);
                    console.log("to:");
                    console.log("----------------------------------");
                    console.log(ans);
                } else{
                    console.log(q)
                    console.log(ans);
                }
                tiku[q]= ans;
                console.log("============================");
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('success');
                res.end();

                last_saved = q

            }
            else if (action == 'delete' ){

                if (tiku.hasOwnProperty(last_saved)){
                    delete tiku[last_saved]
                }
                // res.writeHead(200);
                // res.end("success");
                //
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('success');
                res.end();
                console.log("============================");
                console.log("delete successfully");
                console.log("============================");
                console.log(q)
                console.log(tiku[q]);
                // console.log(tiku);
                console.log("============================");
            } 

            else if (action == 'search'){

                res.writeHead(200);
                if (tiku.hasOwnProperty(q)){
                    console.log("============================");
                    console.log("search successfully");
                    console.log("============================");
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.write(tiku[q]);
                    res.end();
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.write('failed');
                    res.end();

                    console.log("============================");
                    console.log("search failed");
                    console.log("============================");
                    // res.end("failed");
                }
                console.log(tiku);
            }
        });

    }

    // res.writeHead(200);
    // res.end("hello there");
   




};


const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
