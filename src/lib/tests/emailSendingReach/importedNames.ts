import ts from 'typescript';
import { resolveSpecifier } from './resolveSpecifier';

/** A name a file uses that another file declares: that file, and the name it goes by there. */
export type ImportedName = { fromPath: string; name: string };

export const wholeModule = '*';
const defaultExport = 'default';

/** Every name a file takes from another repository file, by import or by re-export, keyed by the name it goes by here. */
export function importedNamesOf(tree: ts.SourceFile, path: string): Map<string, ImportedName> {
	const importedNames = new Map<string, ImportedName>();
	for (const statement of tree.statements) {
		for (const [localName, imported] of namesOfStatement(statement, path)) importedNames.set(localName, imported);
	}
	return importedNames;
}

function namesOfStatement(statement: ts.Statement, path: string): [string, ImportedName][] {
	if (ts.isImportDeclaration(statement)) return namesOfImport(statement, path);
	if (ts.isExportDeclaration(statement)) return namesOfReExport(statement, path);
	return [];
}

function namesOfImport(statement: ts.ImportDeclaration, path: string): [string, ImportedName][] {
	const clause = statement.importClause;
	if (clause === undefined || clause.isTypeOnly) return [];
	const fromPath = resolveSpecifier(path, specifierText(statement.moduleSpecifier));
	if (fromPath === null) return [];
	return [...defaultName(clause, fromPath), ...boundNames(clause, fromPath)];
}

function defaultName(clause: ts.ImportClause, fromPath: string): [string, ImportedName][] {
	const localName = clause.name;
	if (localName === undefined) return [];
	return [[localName.text, { fromPath, name: defaultExport }]];
}

function boundNames(clause: ts.ImportClause, fromPath: string): [string, ImportedName][] {
	const bindings = clause.namedBindings;
	if (bindings === undefined) return [];
	if (ts.isNamedImports(bindings)) return namedSpecifiers(bindings.elements, fromPath);
	const namespaceName = bindings.name;
	return [[namespaceName.text, { fromPath, name: wholeModule }]];
}

function namesOfReExport(statement: ts.ExportDeclaration, path: string): [string, ImportedName][] {
	const clause = statement.exportClause;
	const specifier = statement.moduleSpecifier;
	if (statement.isTypeOnly || specifier === undefined || clause === undefined || !ts.isNamedExports(clause)) return [];
	const fromPath = resolveSpecifier(path, specifierText(specifier));
	if (fromPath === null) return [];
	return namedSpecifiers(clause.elements, fromPath);
}

function specifierText(specifier: ts.Expression): string {
	return (specifier as ts.StringLiteral).text;
}

function namedSpecifiers(
	elements: ts.NodeArray<ts.ImportSpecifier | ts.ExportSpecifier>,
	fromPath: string
): [string, ImportedName][] {
	return elements.filter((element) => !element.isTypeOnly).map((element) => importedNameOf(element, fromPath));
}

function importedNameOf(element: ts.ImportSpecifier | ts.ExportSpecifier, fromPath: string): [string, ImportedName] {
	const { name: localName, propertyName } = element;
	const nameThere = propertyName ?? localName;
	return [localName.text, { fromPath, name: nameThere.text }];
}
