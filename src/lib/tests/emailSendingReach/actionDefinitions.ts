import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { constantText } from './constantText';
import { readSourceModule, type SourceModule } from './sourceModule';

/** Where an action is written: its name, the code that runs it, and the file around it. */
export type ActionDefinition = { name: string; code: ts.Node; sourceModule: SourceModule };

const connectorFolder = 'src/lib/server/mcp';
const nameKey = 'name';
const runKey = 'run';
const sourceFile = /\.ts$/;
const notConnectorCode = /\.(test|fixture)\.ts$|Mocks\.ts$/;

/**
 * Every place the connector's code writes one of the actions named: an object with that name and a run, whose run is
 * the code, or a call that makes one from that name, whose arguments and maker are the code.
 */
export function readActionDefinitions(actionNames: Set<string>): ActionDefinition[] {
	return connectorSourcePaths().flatMap((path) => definitionsIn(readSourceModule(path), actionNames));
}

function connectorSourcePaths(): string[] {
	return readdirSync(connectorFolder, { recursive: true, encoding: 'utf8' })
		.filter((name) => sourceFile.test(name) && !notConnectorCode.test(name))
		.map((name) => join(connectorFolder, name));
}

function definitionsIn(sourceModule: SourceModule, actionNames: Set<string>): ActionDefinition[] {
	const definitions: ActionDefinition[] = [];
	const visit = (node: ts.Node) => {
		const definition = definitionOf(node, sourceModule);
		if (definition && actionNames.has(definition.name)) definitions.push(definition);
		ts.forEachChild(node, visit);
	};
	visit(sourceModule.tree);
	return definitions;
}

function definitionOf(node: ts.Node, sourceModule: SourceModule): ActionDefinition | null {
	if (ts.isObjectLiteralExpression(node)) return definitionByObject(node, sourceModule);
	if (ts.isCallExpression(node)) return definitionByMaker(node, sourceModule);
	return null;
}

function definitionByObject(literal: ts.ObjectLiteralExpression, sourceModule: SourceModule): ActionDefinition | null {
	const nameProperty = propertyNamed(literal, nameKey);
	const run = propertyNamed(literal, runKey);
	if (nameProperty === undefined || run === undefined || !ts.isPropertyAssignment(nameProperty)) return null;
	const name = constantText(nameProperty.initializer, sourceModule);
	if (name === null) return null;
	return { name, code: run, sourceModule };
}

function definitionByMaker(call: ts.CallExpression, sourceModule: SourceModule): ActionDefinition | null {
	const [firstArgument] = call.arguments;
	if (firstArgument === undefined) return null;
	const name = constantText(firstArgument, sourceModule);
	if (name === null) return null;
	return { name, code: call, sourceModule };
}

function propertyNamed(literal: ts.ObjectLiteralExpression, key: string): ts.ObjectLiteralElementLike | undefined {
	return literal.properties.find((property) => isKeyed(property, key));
}

function isKeyed(property: ts.ObjectLiteralElementLike, key: string): boolean {
	const propertyKey = property.name;
	return propertyKey !== undefined && ts.isIdentifier(propertyKey) && propertyKey.text === key;
}
