import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { importedNamesOf, type ImportedName } from './importedNames';
import { resolveSpecifier } from './resolveSpecifier';

/** One source file as the reach reads it: what it declares at its top level, and where each name it imports comes from. */
export type SourceModule = {
	path: string;
	tree: ts.SourceFile;
	declarations: Map<string, ts.Node>;
	imports: Map<string, ImportedName>;
	starReExports: string[];
};

const { Latest: latestSyntax } = ts.ScriptTarget;
const readModules = new Map<string, SourceModule>();

export function readSourceModule(path: string): SourceModule {
	const known = readModules.get(path);
	if (known) return known;
	const text = readFileSync(path, 'utf8');
	const tree = ts.createSourceFile(path, text, latestSyntax, true);
	const imports = importedNamesOf(tree, path);
	const sourceModule = { path, tree, declarations: declarationsOf(tree), imports, starReExports: starReExportsOf(tree, path) };
	readModules.set(path, sourceModule);
	return sourceModule;
}

function declarationsOf(tree: ts.SourceFile): Map<string, ts.Node> {
	const declarations = new Map<string, ts.Node>();
	for (const statement of tree.statements) {
		for (const [name, node] of namedNodesOf(statement)) declarations.set(name, node);
	}
	return declarations;
}

function namedNodesOf(statement: ts.Statement): [string, ts.Node][] {
	if (ts.isVariableStatement(statement)) return variablesOf(statement.declarationList);
	const isNamedDeclaration = ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement);
	if (!isNamedDeclaration) return [];
	const name = statement.name;
	if (name === undefined) return [];
	return [[name.text, statement]];
}

function variablesOf(declarationList: ts.VariableDeclarationList): [string, ts.Node][] {
	return declarationList.declarations.flatMap(namedVariable);
}

function namedVariable(declaration: ts.VariableDeclaration): [string, ts.Node][] {
	const name = declaration.name;
	if (!ts.isIdentifier(name)) return [];
	return [[name.text, declaration]];
}

function starReExportsOf(tree: ts.SourceFile, path: string): string[] {
	return tree.statements
		.filter(ts.isExportDeclaration)
		.filter((statement) => statement.exportClause === undefined && statement.moduleSpecifier !== undefined)
		.map((statement) => statement.moduleSpecifier as ts.StringLiteral)
		.map((specifier) => resolveSpecifier(path, specifier.text))
		.filter((resolved): resolved is string => resolved !== null);
}
