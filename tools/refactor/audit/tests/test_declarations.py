"""A constructor is read as its class's own, never as a function with a home elsewhere."""
from __future__ import annotations

import unittest

from ..declarations import declaredFunctions
from ..worklist.function_usage import FunctionUsage
from .fixtures import csharpHandler, sourceFile

INJECTED_SERVICES = """        logger.Log(command);
        projects.Add(command);
        clock.Tick();"""
ARCHIVE_BODY = """        projects.Archive(command.Id);
        logger.Log(command);
        clock.Tick();"""
TYPESCRIPT_SERVICE = """
export class HttpQueryClient {
  public constructor(private readonly client: HttpClient, private readonly base: string) {
    this.client = client;
    this.base = base;
    this.ready = true;
  }
}
"""
FREE_FUNCTION_NAMED_LIKE_A_TYPE = """
export function Apple(colour: Colour) {
  const apple = new Fruit();
  apple.colour = colour;
  return apple;
}
"""


class ConstructorsAreTheirClassesOwn(unittest.TestCase):
    def test_a_csharp_constructor_is_read_as_one(self):
        functions = declaredFunctions(sourceFile("CreateProjectHandler.cs", csharpHandler("CreateProjectHandler", INJECTED_SERVICES)))
        byName = {function.name: function for function in functions}
        self.assertTrue(byName["CreateProjectHandler"].isConstructor)
        self.assertFalse(byName["Handle"].isConstructor)

    def test_a_typescript_constructor_is_read_as_one(self):
        functions = declaredFunctions(sourceFile("HttpQueryClient.ts", TYPESCRIPT_SERVICE))
        self.assertEqual([function.isConstructor for function in functions], [True])

    def test_a_free_function_is_never_a_constructor(self):
        functions = declaredFunctions(sourceFile("apple.ts", FREE_FUNCTION_NAMED_LIKE_A_TYPE))
        self.assertEqual([function.isConstructor for function in functions], [False])

    def test_the_second_class_in_a_file_owns_its_own_constructor(self):
        text = csharpHandler("CreateProjectHandler", INJECTED_SERVICES) + csharpHandler("ArchiveProjectHandler", ARCHIVE_BODY)
        functions = declaredFunctions(sourceFile("Handlers.cs", text))
        constructors = [function.name for function in functions if function.isConstructor]
        self.assertEqual(constructors, ["CreateProjectHandler", "ArchiveProjectHandler"])


class RepeatedBodiesLeaveConstructorsAlone(unittest.TestCase):
    def test_identical_injection_constructors_are_not_one_function(self):
        files = [
            sourceFile("CreateProjectHandler.cs", csharpHandler("CreateProjectHandler", INJECTED_SERVICES)),
            sourceFile("ArchiveProjectHandler.cs", csharpHandler("ArchiveProjectHandler", ARCHIVE_BODY)),
        ]
        self.assertEqual(FunctionUsage(files).repeatedBodies({}), [])

    def test_an_identical_method_in_two_files_is_still_one_function(self):
        files = [
            sourceFile("CreateProjectHandler.cs", csharpHandler("CreateProjectHandler", INJECTED_SERVICES)),
            sourceFile("RenameProjectHandler.cs", csharpHandler("RenameProjectHandler", INJECTED_SERVICES)),
        ]
        repeated = FunctionUsage(files).repeatedBodies({})
        self.assertEqual([row["name"] for row in repeated], ["Handle"])

