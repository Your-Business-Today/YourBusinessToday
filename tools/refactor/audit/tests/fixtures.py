"""Source files written in memory for the audit's tests."""
from __future__ import annotations

from pathlib import Path

from ..source_files import SourceFile


def sourceFile(relative: str, text: str = "") -> SourceFile:
    return SourceFile(Path(relative), relative, text.splitlines())


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
