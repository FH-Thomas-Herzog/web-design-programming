/**
 * This javascript file contains the implementation of the DOM parser
 * 
 * @author cchet
 */

var containerId = "parser-out";
var domTree = {};

/**
 * recursively walks to the dom tree and Invokes the handle function for each
 * node with no children from the backwards
 */
function walkTree( node) {
	if (node.children.length > 0) {
		for ( var i = 0; i < node.children.length; i++) {
			handleNode(node.children[i].nodeName);
			walkTree(node.children[i]);
		}
	} 
}

/**
 * Handles the node by setting the tag name on the global object which holds the
 * count of the tag because each occurrance the counter will be incremented by
 * one.
 */
function handleNode(name) {
	if (name in domTree) {
		domTree[name] = domTree[name] + 1;
	} else {
		domTree[name] = 1;
	}
}

/**
 * Starts the recursive visit of each node. Prints the result as a table at the
 * bottom of the body tag
 */
function parseDomTree() {
	var th, tr, td;

	/* Reset the former result */
	reset();
	
	/* walk tree if not empty document */
	if (document.children.length > 0) {
		walkTree(document);
	}

	/* Container for result table */
	var container = document.createElement("DIV");
	container.id = containerId;
	container.className = "result-table-container";
	/* result table */
	var table = document.createElement("TABLE");
	var thead = document.createElement("THEAD");
	var tbody = document.createElement("TBODY");

	/* result table header */
	th = document.createElement("TH");
	th.appendChild(document.createTextNode("Tagname"));
	thead.appendChild(th);

	th = document.createElement("TH");
	th.appendChild(document.createTextNode("Occurrances"));
	thead.appendChild(th);

	/* Add rows with object result */
	for ( var propt in domTree) {
		console.log(propt + ": " + domTree[propt]);
		tr = document.createElement("TR");
		td = document.createElement("TD");
		td.appendChild(document.createTextNode(propt));
		tr.appendChild(td);

		td = document.createElement("TD");
		td.appendChild(document.createTextNode(domTree[propt]));
		tr.appendChild(td);

		tbody.appendChild(tr);
	}

	table.appendChild(thead);
	table.appendChild(tbody);
	container.appendChild(table);

	if (document.getElementsByTagName("BODY")[0] != null) {
		document.getElementsByTagName("BODY")[0].appendChild(container);
	} else {
		alert("No body present therefore cannot insert result table");
	}
}

function reset() {
	domTree = {};
	var container = document.getElementById(containerId);
	if (container != null) {
		container.remove();
	}
}