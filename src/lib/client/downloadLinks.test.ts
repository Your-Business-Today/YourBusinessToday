import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceFolder = "src";
const svelteExtension = ".svelte";

const anchorTag = /<a\b[^>]*>/g;
const hrefNamingADownload = /href=[{"][^}"]*download/i;
const downloadAttribute = /\sdownload(?=[\s>=])/;
const reloadAttribute = /\sdata-sveltekit-reload\b/;

function svelteFilePaths(): string[] {
  const relativePaths = readdirSync(sourceFolder, {
    recursive: true,
    encoding: "utf8",
  });
  const sveltePaths = relativePaths.filter((relativePath) =>
    relativePath.endsWith(svelteExtension),
  );
  return sveltePaths.map((relativePath) => join(sourceFolder, relativePath));
}

function isLeftToTheBrowser(anchor: string): boolean {
  return downloadAttribute.test(anchor) || reloadAttribute.test(anchor);
}

function unmarkedDownloadAnchors(filePath: string): string[] {
  const source = readFileSync(filePath, "utf8");
  const anchors = source.match(anchorTag) ?? [];
  const downloadAnchors = anchors.filter((anchor) =>
    hrefNamingADownload.test(anchor),
  );
  return downloadAnchors
    .filter((anchor) => !isLeftToTheBrowser(anchor))
    .map((anchor) => `${filePath}: ${anchor}`);
}

describe("download links", () => {
  it("are left to the browser, so the loading spinner never waits on a page that will not come", () => {
    const claimedAnchors = svelteFilePaths().flatMap(
      unmarkedDownloadAnchors,
    );

    expect(claimedAnchors).toEqual([]);
  });

  it("include the Download buttons on a task attachment", () => {
    const attachmentFiles = [
      "src/lib/components/projects/AttachmentRow.svelte",
      "src/lib/components/projects/AttachmentPreviewModal.svelte",
    ];

    for (const filePath of attachmentFiles) {
      const anchors = readFileSync(filePath, "utf8").match(anchorTag) ?? [];
      const downloadAnchors = anchors.filter((anchor) =>
        hrefNamingADownload.test(anchor),
      );
      expect(downloadAnchors.length).toBeGreaterThan(0);
    }
  });
});
