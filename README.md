The task is to create an application with a user interface consisting of two parts:
    Input: a form containing the following elements:
        File: a file selection element accepting a single JSON file.
        Name: string field, value is referred to as N from here on.
        Distance: numeric field, value is referred as D from here on.

    Output: a region displaying visual output.

The application should accept a JSON file via the file upload element. The JSON file has the following
format:

[
  {
    name: <string>,
    x: <number>,
    y: <number>,
    connections: [
      < list of node names >
    ]
  },
 
  {
    name: <string>,
    x: <number>,
    y: <number>,
    connections: [
      < list of node names >
    ]
  },
 
  ...
]

The JSON file describes a set of nodes, each with an associated name, coordinates, and the other
nodes to which it is connected. The upper limit on the number of nodes is 1000.
When the user has selected an appropriate JSON file, the app should do the following:
    - Determine the nodes whose name contains N: call this set of elements Mn
    - Determine the set of nodes which are no further than D from a node in Mn when travelling along the connections between the nodes: call this set of elements Md.
    
    The output region should display:
        - the names of the nodes in Mn in green text, centred on their x, y coordinates.
        - the names of the nodes in Md and the shortest distance when travelling along the connections between nodes to a member of Md, all in blue text, centred on their x, y coordinates.