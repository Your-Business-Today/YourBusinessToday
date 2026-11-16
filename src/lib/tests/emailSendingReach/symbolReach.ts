import ts from 'typescript';
import { wholeModule, type ImportedName } from './importedNames';
import { resolveSpecifier } from './resolveSpecifier';
import { readSourceModule, type SourceModule } from './sourceModule';

/** Follows the names a piece of code uses, through every file they lead to, looking for the one function sought. */
export class SymbolReach {
	private readonly visited = new Set<string>();
	readonly trail: string[] = [];

	constructor(private readonly sought: ImportedName) {}

	fromNode(node: ts.Node, sourceModule: SourceModule): boolean {
		const reachesByName = usedNamesIn(node).some((name) => this.fromLocalName(name, sourceModule));
		if (reachesByName) return true;
		return dynamicImportsIn(node, sourceModule).some((path) => this.fromSymbol({ fromPath: path, name: wholeModule }));
	}

	private fromLocalName(name: string, sourceModule: SourceModule): boolean {
		if (sourceModule.declarations.has(name)) return this.fromSymbol({ fromPath: sourceModule.path, name });
		const imported = sourceModule.imports.get(name);
		if (imported === undefined) return false;
		return this.fromSymbol(imported);
	}

	private fromSymbol(symbol: ImportedName): boolean {
		const key = `${symbol.fromPath}#${symbol.name}`;
		if (this.visited.has(key)) return false;
		this.visited.add(key);
		const isSought = symbol.fromPath === this.sought.fromPath && symbol.name === this.sought.name;
		const isReached = isSought || this.fromDeclaredSymbol(symbol, readSourceModule(symbol.fromPath));
		if (isReached) this.trail.unshift(symbol.name);
		return isReached;
	}

	private fromEveryDeclaration(sourceModule: SourceModule): boolean {
		const names = [...sourceModule.declarations.keys()];
		return names.some((name) => this.fromLocalName(name, sourceModule));
	}

	private fromDeclaredSymbol(symbol: ImportedName, sourceModule: SourceModule): boolean {
		if (symbol.name === wholeModule) return this.fromEveryDeclaration(sourceModule);
		const declaration = sourceModule.declarations.get(symbol.name);
		if (declaration) return this.fromNode(declaration, sourceModule);
		const imported = sourceModule.imports.get(symbol.name);
		if (imported) return this.fromSymbol(imported);
		return sourceModule.starReExports.some((path) => this.fromSymbol({ fromPath: path, name: symbol.name }));
	}
}

function usedNamesIn(node: ts.Node): string[] {
	const names = new Set<string>();
	const visit = (child: ts.Node) => {
		if (ts.isIdentifier(child) && !isMemberName(child)) names.add(child.text);
		ts.forEachChild(child, visit);
	};
	visit(node);
	return [...names];
}

function isMemberName(identifier: ts.Identifier): boolean {
	const parent = identifier.parent;
	const isAccessedMember = ts.isPropertyAccessExpression(parent) && parent.name === identifier;
	const isPropertyKey = ts.isPropertyAssignment(parent) && parent.name === identifier;
	return isAccessedMember || isPropertyKey;
}

function dynamicImportsIn(node: ts.Node, sourceModule: SourceModule): string[] {
	const paths: string[] = [];
	const visit = (child: ts.Node) => {
		const specifier = dynamicImportSpecifier(child);
		const resolved = specifier === null ? null : resolveSpecifier(sourceModule.path, specifier);
		if (resolved !== null) paths.push(resolved);
		ts.forEachChild(child, visit);
	};
	visit(node);
	return paths;
}

const { ImportKeyword: importKeyword } = ts.SyntaxKind;

function dynamicImportSpecifier(node: ts.Node): string | null {
	if (!ts.isCallExpression(node)) return null;
	const { expression } = node;
	if (expression.kind !== importKeyword) return null;
	const [argument] = node.arguments;
	if (argument === undefined || !ts.isStringLiteral(argument)) return null;
	return argument.text;
}
