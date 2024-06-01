import { LitElement, html, css, nothing } from '../node_modules/lit/index.js';


class DecisionTreeBuilder extends LitElement {
    static styles = css`
        .container {
            display: flex;
            flex-direction: row;
            height: 100vh;
        }
        .properties-panel {
            padding: 10px;
            background-color: #3a3434;
            border-right: 1px solid #ccc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
        }
        #canvas {
            position: relative;
            flex: 1;
            border: 1px solid #ccc;
            margin: 10px;
            overflow: auto;
            background-image: url("images/canvasbg.jpg");
            background-blend-mode: soft-light;
            background-size: cover;
            background-color: antiquewhite;
        }
        .node {
            width: 120px;
            height: 40px;
            border: 1px solid #ccc;
            border-radius: 5px;
            text-align: center;
            line-height: 40px;
            position: absolute;
            cursor: grab;
            z-index: 1
        }
        form {
            display: flex;
            flex-direction: column;
            align-items: center;
            input {
                margin-bottom: 20px;
                border-radius: 50px;
            }
            border-bottom: 2px dashed #c6c3ae;
            margin-bottom: 15px;
            
        }
        button {
            border-radius: 50px;
            font-weight: bold;
            margin-bottom: 10px;
            border: 3px solid red;
        }
        #submit {
            font-weight: bold;
            margin-bottom: 10px;
            border: 3px solid #38c638;
        }
        .line {
            stroke: black;
            stroke-width: 2;
        }
        .text {
            font-size: medium;
            font-weight: bold;
        }
        svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        // height: 693.6;
        // width: 1281.18;
        }
    `;


    constructor() {
        super();
        this.canvas = null;
        this.nodeCounter = 0;
        this.selectedNode = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragging = false;
        this.nodes = [];
        this.connections = [];
    }

    firstUpdated() {
        console.log('DecTree ADDED TO THE DOM');
        // super.connectedCallback();
        this.canvas = this.shadowRoot.getElementById('canvas');
        // this.shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
        this.propertiesPanel = this.shadowRoot.querySelector('.properties-panel');
        if (this.propertiesPanel) {
            this.shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
        }

        this.canvas.addEventListener('click', this.handleNodeClick.bind(this));
        this.canvas.addEventListener('mousedown', this.handleNodeDragStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleNodeDrag.bind(this));
        this.canvas.addEventListener('mouseup', this.handleNodeDragEnd.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const nodeName = form.elements['node-name'].value;
        const color = form.elements['html5colorpicker'].value;
        const description = form.elements['connection-description'].value;

        if (this.selectedNode) {
            // Update the selected node's information
            this.selectedNode.textContent = nodeName;
            this.selectedNode.style.backgroundColor = color;

            // Draw line between the selected node(s) and the connected node
            const connectedNodeNames = Array.from(form.elements['connected-to'].selectedOptions).map(option => option.value);
            connectedNodeNames.forEach(connectedNodeName => {
                const connectedNode = this.nodes.find(node => node.textContent === connectedNodeName);
                if (connectedNode) {
                    // Draw a new connecting line with the updated description
                    this.drawConnectingLine(this.selectedNode, connectedNode, description);
                    }
            });

            this.selectedNode = null;
            this.updateConnectedNodes(); // Update the list of connected nodes
        } else {
            // Create a new node element
            const newNode = document.createElement('div');
            newNode.className = 'node';
            newNode.id = `node_${this.nodeCounter++}`; // Generate unique ID
            newNode.textContent = nodeName;
            newNode.style.backgroundColor = color;
            // newNode.style.position = 'absolute';
            // newNode.style.zIndex = '1';

            // Add the new node to the canvas area
            this.canvas.appendChild(newNode);

            // Update the list of connected nodes
            this.nodes.push(newNode);
            this.updateConnectedNodes();


        }
        // Reset the form fields
        form.reset();
    }

    drawConnectingLine(startNode, endNode, description) {
        const svgNamespace = 'http://www.w3.org/2000/svg';
        const svg = this.shadowRoot.querySelector('svg');
        const line = document.createElementNS(svgNamespace, 'line');

        // Check if a connection already exists between the startNode and endNode
        const existingConnection = this.connections.find(connection => {
            return (connection.startNode === startNode && connection.endNode === endNode) ||
                (connection.startNode === endNode && connection.endNode === startNode);
        });

        if (existingConnection) {
            // If a connection already exists, update its description
            existingConnection.description = description;
            existingConnection.text.textContent = description; // Update the text content
            return; // Exit the function since no new connection needs to be drawn
        }

        const text = document.createElementNS(svgNamespace, 'text');
        text.textContent = description;

        const startX = parseFloat(startNode.style.left) + startNode.offsetWidth / 2;
        const startY = parseFloat(startNode.style.top) + startNode.offsetHeight / 2;
        const endX = parseFloat(endNode.style.left) + endNode.offsetWidth / 2;
        const endY = parseFloat(endNode.style.top) + endNode.offsetHeight / 2;

        const textX = (startX + endX) / 2;
        const textY = (startY + endY) / 2;

        line.setAttribute('class', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('data-start-node', startNode.id); // Store the ID of the start node
        line.setAttribute('data-end-node', endNode.id); // Store the ID of the end node

        text.setAttribute('class', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('data-start-node', startNode.id); // Store the ID of the start node
        text.setAttribute('data-end-node', endNode.id); // Store the ID of the end node

        svg.appendChild(line);
        svg.appendChild(text);
        this.canvas.appendChild(svg);
        this.connections.push({ startNode, endNode, line, description, text });

        const texts = Array.from(this.canvas.querySelectorAll('.text'));
        console.log("Showing desc on canvas in drawConnectingLine: " + texts);
        const lines = Array.from(this.canvas.querySelectorAll('.line'));
        console.log("Showing lines on canvas in drawConnectingLine: " + lines);
    }

    handleNodeClick(event) {
        const deleteButton = this.shadowRoot.getElementById('deleteButton');
        if (event.target.classList.contains('node')) {
            // Set the selected node
            this.selectedNode = event.target;

            // Display the selected node's information in the form
            const form = this.shadowRoot.querySelector('form');
            form.elements['node-name'].value = this.selectedNode.textContent;
            form.elements['html5colorpicker'].value = this.rgbToHex(this.selectedNode.style.backgroundColor);
            // Update the list of connected nodes
            this.updateConnectedNodes();
            // Show the delete button
            deleteButton.style.display = 'inline-block';
        } else {
            this.selectedNode = null;
            // Display the selected node's information in the form
            const form = this.shadowRoot.querySelector('form');
            form.elements['node-name'].value = null;
            form.elements['html5colorpicker'].value = '#ff0000';
            // Hide the delete button
            deleteButton.style.display = 'none';
        }
    }

    // Function to convert RGB color to hexadecimal color
    rgbToHex(rgb) {
        // Split the RGB value into individual components
        const rgbArray = rgb.match(/\d+/g).map(Number);
        // Convert the RGB components to hexadecimal format
        const hexArray = rgbArray.map(component => {
            const hex = component.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        });
        // Join the hexadecimal components to form the color value
        return "#" + hexArray.join("");
    }

    handleNodeDragStart(event) {
        if (event.target.classList.contains('node')) {
            this.dragging = true;
            this.selectedNode = event.target;
            const bounds = this.selectedNode.getBoundingClientRect();
            this.offsetX = event.clientX - bounds.left;
            this.offsetY = event.clientY - bounds.top;
        }
    }

    handleNodeDrag(event) {
        if (this.dragging && this.selectedNode) {
            const x = event.clientX - this.offsetX;
            const y = event.clientY - this.offsetY;
            this.selectedNode.style.left = `${x}px`;
            this.selectedNode.style.top = `${y}px`;
            // Update the positions of connecting lines
            this.updateConnectingLines();
        }
    }

    handleNodeDragEnd(event) {
        this.dragging = false;
    }


    updateConnectedNodes() {
        if (this.selectedNode) {
            // Update the list of connected nodes in the properties panel
            const connectedToSelect = this.propertiesPanel.querySelector('#connected-to');
            connectedToSelect.innerHTML = '';

            this.nodes.forEach(node => {
                if (node !== this.selectedNode) {
                    const option = document.createElement('option');
                    option.value = node.textContent;
                    option.textContent = node.textContent;
                    // Highlight connected nodes
                    if (this.isConnected(this.selectedNode, node)) {
                        option.style.fontWeight = 'bold';
                    } else option.style.fontWeight = 'normal';
                    connectedToSelect.appendChild(option);

                    // Add click event listener to deselect nodes
                    option.addEventListener('click', (event) => {
                        const clickedNodeName = event.target.value;
                        const clickedNode  = this.nodes.find(node => node.textContent === clickedNodeName);

                        const connectedConnections = this.connections.filter(connection => {
                            return connection.startNode === this.selectedNode && connection.endNode === clickedNode && connection.description !== null;
                        });
                        console.log("Deselecting a connection with node: " + connectedConnections);
                        const texts = Array.from(this.canvas.querySelectorAll('.text'));
                        console.log("Showing desc on canvas before showDescriptionAndDeleteButton: " + texts);
                        const lines = Array.from(this.canvas.querySelectorAll('.line'));
                        console.log("Showing lines on canvas before showDescriptionAndDeleteButton: " + lines);
                        if (connectedConnections.length !== 0) {
                            this.showDescriptionAndDeleteButton(connectedConnections[0]);
                        }

                        // if (clickedNode) {
                        //     this.removeConnection(this.selectedNode, clickedNode);
                        //     event.target.style.fontWeight = 'normal'; // Remove highlighting
                        // }
                    });
                }
            });
        }
    }

    showDescriptionAndDeleteButton(connection) {
        // Show the description in the connection description input field
        const descriptionInput = this.shadowRoot.querySelector('#connection-description');
        descriptionInput.value = connection.description;

        // Show the delete button
        const deleteButton = this.shadowRoot.querySelector('#deleteButtonCon');
        deleteButton.style.display = 'inline-block';

        // Add click event listener to delete the connection
        deleteButton.addEventListener('click', () => {
            console.log("About to delete connection");
            this.removeConnection(connection);
            // Reset the description input field
            descriptionInput.value = '';
            // Hide the delete button
            deleteButton.style.display = 'none';
        });
    }

    // Check if two nodes are connected
    isConnected(node1, node2) {
        return this.connections.some(connection => {
            return (connection.startNode === node1 && connection.endNode === node2) ||
                (connection.startNode === node2 && connection.endNode === node1);
        });
    }

    // Remove connection between two nodes
    removeConnection(connection) {
        const index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
            connection.line.remove();
            const lineToRemove = Array.from(this.canvas.querySelectorAll('.line')).filter(line => {
                return line.dataset.startNode === connection.startNode.id && line.dataset.endNode === connection.endNode.id;
            });
            lineToRemove.forEach(line => line.remove());
            const textToRemove = Array.from(this.canvas.querySelectorAll('.text')).filter(text => {
                return text.dataset.startNode === connection.startNode.id && text.dataset.endNode === connection.endNode.id;
            });
            textToRemove.forEach(text => text.remove());
        }

        console.log("Connection deleted");

        // Update the connected nodes list and the connecting lines
        this.updateConnectedNodes();
        this.updateConnectingLines();
    }

    updateConnectingLines() {
        console.log('Starting dragging lines');
        // Iterate over each line
        this.connections.forEach(connection => {
            const startNode = connection.startNode;
            const endNode = connection.endNode;
            const line = connection.line;
            const text = connection.text;

            if (startNode && endNode && line && text) {
                // Calculate the coordinates for the line
                const startX = parseFloat(startNode.style.left) + startNode.offsetWidth / 2;
                const startY = parseFloat(startNode.style.top) + startNode.offsetHeight / 2;
                const endX = parseFloat(endNode.style.left) + endNode.offsetWidth / 2;
                const endY = parseFloat(endNode.style.top) + endNode.offsetHeight / 2;

                // Update the attributes of the line
                line.setAttribute('x1', startX);
                line.setAttribute('y1', startY);
                line.setAttribute('x2', endX);
                line.setAttribute('y2', endY);

                // Calculate the coordinates for the text
                const textX = (startX + endX) / 2;
                const textY = (startY + endY) / 2;

                // Update the attributes of the text
                text.setAttribute('x', textX);
                text.setAttribute('y', textY);
            }
        });


    }


    exportDecisionTree() {
        const decisionTreeData = {
            nodes: this.nodes.map(node => ({
                id: node.id,
                name: node.textContent,
                style: {
                    backgroundColor: node.style.backgroundColor,
                    left: node.style.left,
                    top: node.style.top
                }
            })),
            connections: this.connections.map(connection => ({
                startNodeId: connection.startNode.id,
                endNodeId: connection.endNode.id,
                description: connection.description
            }))
        };
        const jsonData = JSON.stringify(decisionTreeData);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decision_tree.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importDecisionTree(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const jsonData = reader.result;
            const decisionTreeData = JSON.parse(jsonData);
            // Load the decision tree data into the builder
            this.loadDecisionTree(decisionTreeData);
        };
        reader.readAsText(file);
    }

    loadDecisionTree(decisionTreeData) {
        // Clear existing nodes and connections
        this.nodes = [];
        this.connections = [];

        // Create nodes
        decisionTreeData.nodes.forEach(nodeData => {
            const newNode = document.createElement('div');
            newNode.className = 'node';
            newNode.id = nodeData.id;
            newNode.textContent = nodeData.name;
            newNode.style.backgroundColor = nodeData.style.backgroundColor;
            newNode.style.left = nodeData.style.left;
            newNode.style.top = nodeData.style.top;
            newNode.addEventListener('mousedown', this.handleNodeDragStart.bind(this));
            newNode.addEventListener('mousemove', this.handleNodeDrag.bind(this));
            newNode.addEventListener('mouseup', this.handleNodeDragEnd.bind(this));
            this.nodes.push(newNode);
            this.canvas.appendChild(newNode);
        });

        // Create connections
        decisionTreeData.connections.forEach(connectionData => {
            const startNode = this.nodes.find(node => node.id === connectionData.startNodeId);
            const endNode = this.nodes.find(node => node.id === connectionData.endNodeId);
            const description = connectionData.description;
            if (startNode && endNode) {
                this.drawConnectingLine(startNode, endNode, description);
            }
        });
    }

    deleteSelectedNode() {
        if (this.selectedNode) {
            // Remove connections related to the selected node
            this.connections = this.connections.filter(connection => {
                return connection.startNode !== this.selectedNode && connection.endNode !== this.selectedNode;
            });

            // Remove the selected node from the canvas
            this.selectedNode.remove();

            // Remove the selected node from the list of nodes
            this.nodes = this.nodes.filter(node => node !== this.selectedNode);

            // Remove SVG lines associated with the selected node
            const linesToRemove = Array.from(this.canvas.querySelectorAll('.line')).filter(line => {
                return line.dataset.startNode === this.selectedNode.id || line.dataset.endNode === this.selectedNode.id;
            });
            linesToRemove.forEach(line => line.remove());
            const textToRemove = Array.from(this.canvas.querySelectorAll('.text')).filter(text => {
                return text.dataset.startNode === this.selectedNode.id || text.dataset.endNode === this.selectedNode.id;
            });
            textToRemove.forEach(text => text.remove());


            // Update the connected nodes list and the connecting lines
            this.updateConnectedNodes();
            this.updateConnectingLines();
        }
    }



    render() {
        return html`
            <div class="container">
                <!-- Properties panel -->
                <div class="properties-panel">
                    <form>
                        <label for="node-name">Node name:</label><br>
                        <input type="text" id="node-name" name="node-name"><br>
                        <label for="html5colorpicker">Color:</label><br>

                        <input type="color" id="html5colorpicker" value="#ff0000" name="html5colorpicker" style="width:85%;">

                        <label for="connected-to">Connected to:</label><br>
                        <select id="connected-to" name="connected-to" multiple>
                            <!-- Options for connected nodes will be dynamically populated -->
                        </select><br>
                        <label for="connection-description">Connection description:</label><br>
                        <input type="text" id="connection-description" name="connection-description"><br>

                        <button id="deleteButton" @click="${this.deleteSelectedNode}" style="display: none;">Delete Node</button>
                        <button id="deleteButtonCon" style="display: none;">Delete Connection</button>

                        <input type="submit" value="Submit" id="submit">
                    </form>
                    <button @click="${this.exportDecisionTree}">Export Decision Tree</button><br>
                    <label for="import-tree">Import Decision Tree</label><br>
                    <input type="file" id="import-tree" name="import-tree" @change="${this.importDecisionTree}">
                </div>
                <!-- Canvas area for displaying the decision tree -->
                <div id="canvas">
                    <svg>
                    <!-- Canvas content will be dynamically generated -->
                    </svg>
                </div>
            </div>
        `;
    }

}


customElements.define('decision-tree', DecisionTreeBuilder);