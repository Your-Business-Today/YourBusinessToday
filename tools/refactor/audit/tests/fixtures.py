"""Source files written in memory for the audit's tests."""
from __future__ import annotations

from pathlib import Path

from ..source_files import SourceFile


ONE_COLUMN_ENTITY = """
public sealed class {name}Entity
{{
    public string Reference {{ get; set; }} = "";
}}
"""
ENTITY_GLOBS = ["api/Data/Entities/*.cs"]


def sourceFile(relative: str, text: str = "") -> SourceFile:
    return SourceFile(Path(relative), relative, text.splitlines())


def oneColumnEntity(name: str, fileCount: int) -> list:
    files = [sourceFile(f"api/Data/Entities/{name}Entity.cs", ONE_COLUMN_ENTITY.format(name=name))]
    files += [sourceFile(f"api/Features/{name}Role{index}.cs") for index in range(fileCount - 1)]
    return files


def csharpHandler(className: str, methodBody: str) -> str:
    return f"""
public sealed class {className}
{{
    private readonly IClock clock;
    private readonly IProjects projects;
    private readonly ILogger logger;

    public {className}(IClock clock, IProjects projects, ILogger logger)
    {{
        this.clock = clock;
        this.projects = projects;
        this.logger = logger;
    }}

    public void Handle(Command command)
    {{
{methodBody}
    }}
}}
"""
