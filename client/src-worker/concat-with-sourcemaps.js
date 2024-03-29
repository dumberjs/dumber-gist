// Copy of not published concat-with-sourcemaps v2
// https://github.com/floridoo/concat-with-sourcemaps/blob/releases/v2/index.js

import { SourceMapGenerator, SourceMapConsumer } from 'source-map';

if (typeof process === 'undefined' || process.browser) {
  SourceMapConsumer.initialize({
    "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.4/lib/mappings.wasm"
  });
}

function unixStylePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

export default class Concat {
  constructor(generateSourceMap, fileName, separator) {
    this.lineOffset = 0;
    this.columnOffset = 0;
    this.sourceMapping = generateSourceMap;
    this.contentParts = [];
    if (separator === undefined) {
      this.separator = Buffer.from('');
    }
    else {
      this.separator = Buffer.from(separator);
    }
    if (this.sourceMapping) {
      this._sourceMap = new SourceMapGenerator({ file: unixStylePath(fileName) });
      this.separatorLineOffset = 0;
      this.separatorColumnOffset = 0;
      const separatorString = this.separator.toString();
      for (var i = 0; i < separatorString.length; i++) {
        this.separatorColumnOffset++;
        if (separatorString[i] === '\n') {
          this.separatorLineOffset++;
          this.separatorColumnOffset = 0;
        }
      }
    }
  }

  async add(filePath, content, sourceMap) {
    filePath = filePath && unixStylePath(filePath);
    if (!Buffer.isBuffer(content)) {
      content = Buffer.from(content);
    }
    if (this.contentParts.length !== 0) {
      this.contentParts.push(this.separator);
    }
    this.contentParts.push(content);
    if (this.sourceMapping) {
      const contentString = content.toString();
      const lines = contentString.split('\n').length;
      if (Object.prototype.toString.call(sourceMap) === '[object String]')
        sourceMap = JSON.parse(sourceMap);
      if (sourceMap && sourceMap.mappings && sourceMap.mappings.length > 0) {
        const upstreamSM = await (new SourceMapConsumer(sourceMap));
        upstreamSM.eachMapping((mapping) => {
          if (mapping.source) {
            this._sourceMap.addMapping({
              generated: {
                line: this.lineOffset + mapping.generatedLine,
                column: (mapping.generatedLine === 1 ? this.columnOffset : 0) + mapping.generatedColumn
              },
              original: mapping.originalLine == null ? null : {
                line: mapping.originalLine,
                column: mapping.originalColumn
              },
              source: mapping.originalLine != null ? mapping.source : null,
              name: mapping.name
            });
          }
        });
        if (upstreamSM.sourcesContent) {
          upstreamSM.sourcesContent.forEach((sourceContent, i) => {
            this._sourceMap.setSourceContent(upstreamSM.sources[i], sourceContent);
          });
        }
        upstreamSM.destroy();
      } else {
        if (sourceMap && sourceMap.sources && sourceMap.sources.length > 0)
          filePath = sourceMap.sources[0];
        if (filePath) {
          for (var i = 1; i <= lines; i++) {
            this._sourceMap.addMapping({
              generated: {
                line: this.lineOffset + i,
                column: (i === 1 ? this.columnOffset : 0)
              },
              original: {
                line: i,
                column: 0
              },
              source: filePath
            });
          }
          if (sourceMap && sourceMap.sourcesContent)
            this._sourceMap.setSourceContent(filePath, sourceMap.sourcesContent[0]);
        }
      }
      if (lines > 1)
        this.columnOffset = 0;
      if (this.separatorLineOffset === 0)
        this.columnOffset += contentString.length - Math.max(0, contentString.lastIndexOf('\n') + 1);
      this.columnOffset += this.separatorColumnOffset;
      this.lineOffset += lines - 1 + this.separatorLineOffset;
    }
  }

  get content() {
    return Buffer.concat(this.contentParts);
  }

  get sourceMap() {
    return this._sourceMap ? this._sourceMap.toString() : undefined;
  }
}
