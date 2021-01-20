const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const { BADFLAGS } = require('dns');
const { forEach } = require('lodash');
const { start } = require('repl');

const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static(__dirname + '/public')); 

const port = process.env.PORT || 3000;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);

app.get('/', function(req, res){
    res.render('index.html');
});

app.post('/upload-file', async (req, res) => {
    var Mn = [];
    var Md = [];
    var shortDists = [];
    var sDiststoMn = [];
    //var canvasSize = [];
    var allX = [];
    var allY = [];

    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let nodeConnects = req.files.file;
            let inputName = req.body.name;
            let inputDistance = parseInt(req.body.distance);

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            nodeConnects.mv('./uploads/' + nodeConnects.name);

            var nodesObj = JSON.parse(nodeConnects.data);

            // if(nodesObj.length > 1000){
            //     console.log('Exceeds the number of input nodes');
            // }

            //Populates Mn array with nodes connecting to the inputted node N
            nodesObj.forEach(node => {
                allX.push(node.x);
                allY.push(node.y);
                for(var i = 0 in node.connections){
                    if(node.connections[i] == inputName){
                        Mn.push(node);
                    }
                }
            });

            allX.sort();
            allY.sort();

           // canvasSize.push(allX.shift(),allX.pop(),allY.shift(),allY.shift());

            console.log("Mn:");
            Mn.forEach(node=>{
                console.log(node.name);
                var nodesWithinDistance = dfs(nodesObj, node, inputDistance);   
                    if(nodesWithinDistance.length > 0){         //When there are no nodes within distance don't bother with other steps
                        nodesWithinDistance.forEach(nodeWD => {
                            if(!Md.includes(nodeWD)){
                                Md.push(nodeWD);
                            }
    
                        });    
                    }
            });



            console.log("Md:");
            // let shortDists = [];
            // let sDiststoMn = [];
            
            Md.forEach(node=>{
                console.log(node.name);
                let nodalShortDists = findShortestDist(node, nodesObj);

                nodalShortDists.forEach((nodeVal,nodeKey) =>{
                    Mn.forEach(MnNode => {
                        if(nodeKey == MnNode){
                            if(nodeVal != Infinity && nodeVal != 0){
                                sDiststoMn.push(nodeVal);
                            }
                        }
                    })
                    
                })

                sDiststoMn.sort();
                if(sDiststoMn.length != 0){

                    var distMn = {
                        "node": node,
                        "shortestDistToMnNode": sDiststoMn.shift(),
                    }

                    shortDists.push(distMn);
                }
                sDiststoMn = [];
            });
        }

        let jsonResponse = {
            "Mn_Nodes": Mn,
            "Md_Nodes": Md,
            "distances": shortDists,
        }

        res.json(jsonResponse);

    } catch (err) {
        res.status(500).send(err);
    }
});



//app.use('/', express.static(__dirname + '/public')); 


//distance function
function calcDist(currNode, currNeighbour){
    let x1 = currNode.x;
    let y1 = currNode.y;
    let x2 = currNeighbour.x;
    let y2 = currNeighbour.y;


    let dist = Math.pow((x2-x1),2) + Math.pow((y2-y1),2);
    dist = Math.sqrt(dist)
    return dist;
}

function dfs(graph, start, distLimit){
    let pathDists = new Map();  //map that for each entry contains a key which is a node and the value being a JSON object
                                //with current accumulated path distance and a boolean to indicate if the node is at the distance limit
    let nodeList = [];
    let accumuDist = 0;

    graph.forEach(graphNode => {
        var pathLimit;
        if(graphNode == start){
            pathLimit =  {
                "pathDistance":0,
                "hitDistLimit":false,
            };
        }
        else{
            pathLimit =  {
                "pathDistance":Infinity,        //if this has not changed from Infinity that indicates it wasn't visited and won't be in Md list
                "hitDistLimit":false,
            };
        }
        pathDists.set(graphNode,pathLimit);
    });

    dfsRecursive(graph, start, distLimit, pathDists, accumuDist);

    pathDists.forEach((nodeVal,nodeKey) =>{
        if(nodeVal.pathDistance != Infinity && nodeVal.pathDistance !=0){
            nodeList.push(nodeKey);

        }
    }); 

    return nodeList;
}

function dfsRecursive(graph, current, distLimit, pathDists, accumuDist){
    pathDists.get(current).pathDistance = accumuDist;   //it overrides old path distances, it works out fine

    var curConnections = current.connections;
    var curConnectedNodes = [];

    graph.forEach(graphNode => {
        if(curConnections.includes(graphNode.name)){
            curConnectedNodes.push(graphNode);
        }
    });

    curConnectedNodes.forEach(neighbor => {
        accumuDist = pathDists.get(current).pathDistance;   //to re-evaluate when falling back from recursion and starting again from an earlier node
        var possibleDist = pathDists.get(current).pathDistance + calcDist(current, neighbor);
        if(possibleDist <= distLimit){
            //dont increment dist, set hitDistLimit to true
            //pathDists.get(current)
            accumuDist += possibleDist;
            dfsRecursive(graph, neighbor, distLimit, pathDists, accumuDist);
        }
    });

}

//dijkstras algorithm
function findShortestDist(startNode, graph){
    let totalCosts = new Map(); 

    let prev = new Map();
    let pq = [];
    let visited = [];

    totalCosts.set(startNode, 0);
    pq.push(startNode);             //add start node as it is the smallest cost node

    graph.forEach(node => {
        if(node != startNode){
            totalCosts.set(node, Infinity);
        }
        prev.set(node, null);
    });

    while(pq.length != 0){
        let currNode = pq.pop();        //lowest Distance node will be at the end of queue
        visited.push(currNode);         //add to visited

        let neighbours = currNode.connections;

        graph.forEach(neighbour => {
            if(neighbours.includes(neighbour.name)){
                if(!pq.includes(neighbour) && !visited.includes(neighbour)){
                    pq.push(neighbour);
                }
                
                //totalCosts.set(neighbour, totalCosts.get(currNode) + calcDist(currNode, neighbour));
            }
        });

        pq.forEach(neighbour => {
                if(!visited.includes(neighbour)){

                    let altPath = totalCosts.get(currNode) + calcDist(currNode, neighbour);

                    if(altPath < totalCosts.get(neighbour)){
                        totalCosts.set(neighbour, altPath);
                        prev.set(neighbour, currNode);

                        //let tempNode = pq.pop();


                    }
                }

            //curNeighbours.push(graphNode);

        });

        //bubble sort order pq with comparator so that next node to make current
        for(var i = 0; i < pq.length - 1; i++){
            if(totalCosts.get(pq[i]) < totalCosts.get(pq[i+1])){
                let temp = pq[i];
                pq[i] = pq[i+1];
                pq[i+1] = temp;
            }
        }


    }

    return totalCosts;
}
