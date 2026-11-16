import ts from 'typescript';
import { readSourceModule, type SourceModule } from './sourceModule';

/** The text a node stands for when it is written as a string, or names a constant holding one; null otherwise. */
export function constantText(node: ts.Node, sourceModule: SourceModule): string | null {
	const expression = withoutConstAssertion(node);
	if (ts.isStringLiteralLike(expression)) return expression.text;
	if (ts.isIdentifier(expression)) return textOfName(expression.text, sourceModule);
	if (ts.isPropertyAccessExpression(expression)) return textOfMember(expression, sourceModule);
	return null;
}

function withoutConstAssertion(node: ts.Node): ts.Node {
	if (ts.isAsExpression(node)) return node.expression;
	return node;
}

function textOfName(name: string, sourceModule: SourceModule): string | null {
	const initializer = initializerOf(name, sourceModule);
	if (initializer === null) return null;
	return constantText(initializer.node, initializer.sourceModule);
}

function textOfMember(access: ts.PropertyAccessExpression, sourceModule: SourceModule): string | null {
	const { expression: holderName, name: memberName } = access;
	if (!ts.isIdentifier(holderName)) return null;
	const initializer = initializerOf(holderName.text, sourceModule);
	if (initializer === null) return null;
	const holder = withoutConstAssertion(initializer.node);
	if (!ts.isObjectLiteralExpression(holder)) return null;
	const member = holder.properties.find((property) => keyTextOf(property) === memberName.text);
	if (member === undefined || !ts.isPropertyAssignment(member)) return null;
	return constantText(member.initializer, initializer.sourceModule);
}

function keyTextOf(property: ts.ObjectLiteralElementLike): string | undefined {
	const key = property.name;
	return key?.getText();
}

function initializerOf(name: string, sourceModule: SourceModule): { node: ts.Node; sourceModule: SourceModule } | null {
	const declaration = sourceModule.declarations.get(name);
	if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer) return { node: declaration.initializer, sourceModule };
	const imported = sourceModule.imports.get(name);
	if (imported === undefined) return null;
	return initializerOf(imported.name, readSourceModule(imported.fromPath));
}
