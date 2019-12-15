import input from './input';
import testInput from './test_input';
import _ from 'lodash';

const orbits = input.orbits.split("\n");
// const orbits = testInput.orbits.split("\n");

interface Node {
    name: string
    centerName: string;
    center?: Node;
    pathLength?: number;
}

function parseOrbit(s: string) {
    const parsed = s.split(")");
    return {
        name: parsed[1],
        centerName: parsed[0],
    };
}

function buildNodes(orbits: string[]) {
    const nodes: Node[] = [{name: 'COM', centerName: 'INVALID', pathLength: 0}];
    for (const orbit of orbits) {
        nodes.push(parseOrbit(orbit));
    }

    return nodes;
}

function findNode(name: string, allNodes: Node[]): Node {
    const node = _.find(allNodes, {name});
    if (!node) {
        throw new Error(`Failed to find node with name=${name}`);
    }

    return node;
}

function calcPathLength(node: Node, nodes: Node[]): number {
    if (node.pathLength !== undefined) {
        return node.pathLength;
    } else if (node.center) {
        return calcPathLength(node.center, nodes) + 1;
    }
    
    node.center = findNode(node.centerName, nodes);
    node.pathLength = calcPathLength(node.center, nodes) + 1; 
    return node.pathLength;
 }

function calcChecksum(nodes: Node[]) {
    let totalLength = 0;
    for (const node of nodes) {
        totalLength += calcPathLength(node, nodes);
    }
    return totalLength;
}

function getNodesOnPath(node: Node, allNodes: Node[], nodesOnPath: Node[] = []): Node[] {
    if (node.name === 'COM') {
        return nodesOnPath;
    }

    if (!node.center) {
        node.center = findNode(node.centerName, allNodes);
    }

    nodesOnPath.push(node.center);

    
    return getNodesOnPath(node.center, allNodes, nodesOnPath);
}

function calcNumTransfers(leftName: string, rightName: string, allNodes: Node[]) {
    const leftNode = findNode(leftName, allNodes);
    const rightNode = findNode(rightName, allNodes);

    const leftNodes = getNodesOnPath(leftNode, allNodes);
    const rightNodes = getNodesOnPath(rightNode, allNodes);

    const closestCommonNode = _.sortBy(
        _.intersection(leftNodes, rightNodes), 
        node => calcPathLength(node, allNodes)
    ).pop();

    if (!closestCommonNode) {
        throw new Error("Failed to find closest common node");
    }

    return (calcPathLength(leftNode, allNodes) - calcPathLength(closestCommonNode, allNodes)) + (
        calcPathLength(rightNode, allNodes) - calcPathLength(closestCommonNode, allNodes)) - 2;
}


const allNodes = buildNodes(orbits);
console.log(calcChecksum(allNodes));
console.log(calcNumTransfers("YOU", "SAN", allNodes));

