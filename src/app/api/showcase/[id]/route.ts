import { readFile, readdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import yaml from "js-yaml";
import { readFileSync } from "fs";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const ITEMS_PER_PAGE = 3;
  const currentPage = Number(context.params.id);
  const dirRelativeToPublicFolder = "showcase";
  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  try {
    const files = await readdir(dir);
    const filteredFiles = files
      .filter((file) => !file.includes("."))
      .sort((a, b) => Number(b) - Number(a));
    const paginatedFiles = paginateArray(
      filteredFiles,
      currentPage,
      ITEMS_PER_PAGE
    );
    const fileResults = await Promise.all(
      paginatedFiles.map(async (file) => {
        const fileDir = path.resolve(dir, file);
        const fileLists = await readdir(fileDir);
        const fileListsFilterOutYaml = fileLists.filter(
          (v) => !v.endsWith(".yml")
        );
        const filesWithCount = await Promise.all(
          fileListsFilterOutYaml.map(async (fileName) => {
            const filePath = path.resolve(fileDir, fileName);
            const fileData = await readFile(filePath, "utf-8");

            const yamlFilePath = path.join(
              fileDir,
              `${fileName.replace(".html", ".yml")}`
            );

            const yamlFileExists = await fileExists(yamlFilePath);
            const yamlContent = yamlFileExists
              ? yaml.load(readFileSync(yamlFilePath, "utf8"))
              : ("" as any);
            let name = null;
            let auther = null;
            let color = "primary";
            let tags = [];
            if (yamlContent) {
              name = yamlContent.name;
              auther = yamlContent.auther;
              color = yamlContent.color || color;
              tags = yamlContent.tags;
            }

            return {
              fileName,
              characterCount: fileData.trim().length,
              name: name,
              auther: auther,
              color,
              tags,
            };
          })
        );
        filesWithCount.sort((a, b) => {
          return a.characterCount - b.characterCount;
        });
        return { folder: file, files: filesWithCount };
      })
    );
    fileResults.sort((a, b) => Number(b.folder) - Number(a.folder));

    return NextResponse.json({
      files: fileResults,
      totalItems: filteredFiles.length,
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.error();
  }

  function paginateArray(
    array: any[],
    currentPage: number,
    itemsPerPage: number
  ) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
  }

  async function fileExists(filePath: string) {
    try {
      await readFile(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}