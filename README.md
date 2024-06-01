# DecisionTreeBuilder

The Decision Tree Builder is a web application built using LitElement, which allows users to visually create and manipulate decision trees.

## :link: Dependencies
 ![Static Badge](https://img.shields.io/badge/Lit-%23324FFF?logo=lit) 
 
 ![Static Badge](https://img.shields.io/badge/HTML5-Colour%20Picker-%23E34F26?logo=html5) - used for selecting nodes color

## :clipboard: Usage
The app presents the following features:
1. **Node Creation and Editing**
    - Users can create nodes by entering a node name and selecting a color from the color wheel.
    - Nodes are draggable within the canvas area.
    - Existing nodes can be selected for editing, where users can change the node name, color and its' connections.

2. **Connection Management**
    - Users can connect nodes by selecting them from a dropdown list.
    - A description can also be added to the connection.
    - Connections between nodes are represented as lines with descriptions.

3. **Export and Import**
    - Users can export the decision tree as a JSON file.
    - Importing a JSON file allows users to load previously saved decision trees.
  
4. **Deleting Nodes**
    - Users can delete nodes, which also removes associated connections. 

## :file_folder: File Structure
-	**index.html** : HTML file defining the structure of the web page.
- **decision-tree-builder.js** : JavaScript file containing the main component definition and logic.

## :bulb: Future work
- Adding undo/redo functionality for node and connection modifications.
- Implementing zoom and pan features for better navigation of large decision trees.
- Enhancing the visual representation of connections with arrowheads and different line styles.

