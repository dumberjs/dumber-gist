import test from 'tape-promise/tape';
import {FileTree} from '../../../src/edit/file-tree';

const bindingEngine = {
  propertyObserver() {
    return {
      subscribe() {}
    };
  }
};

test('FileTree generates tree', t => {
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main',
        isChanged: false
      },
      {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}',
        isChanged: false
      }
    ]
  };

  const ft = new FileTree(session, bindingEngine);
  ft._updateTree();

  t.deepEqual(ft.tree, [
    {
      filePath: 'src',
      dirPath: '',
      name: 'src',
      isChanged: false,
      files: [
        {
          filePath: 'src/main.js',
          dirPath: 'src',
          name: 'main.js',
          isChanged: false,
          file: {
            filename: 'src/main.js',
            content: 'main',
            isChanged: false
          }
        }
      ]
    },
    {
      filePath: 'index.html',
      dirPath: '',
      name: 'index.html',
      isChanged: false,
      file: {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      }
    },
    {
      filePath: 'package.json',
      dirPath: '',
      name: 'package.json',
      isChanged: false,
      file: {
        filename: 'package.json',
        content: '{"dependencies":{}}',
        isChanged: false
      }
    }
  ]);
  t.end();
});

test('FileTree generates deep tree with isChanged flags', t => {
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main',
        isChanged: false
      },
      {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      },
      {
        filename: 'src/foo/index.js',
        content: 'foo-index',
        isChanged: true
      },
      {
        filename: 'src/foo/bar.js',
        content: 'foo-bar',
        isChanged: false
      },
      {
        filename: 'src/lo/index.js',
        content: 'lo-index',
        isChanged: false
      },
      {
        filename: 'src/lo/bar.js',
        content: 'lo-bar',
        isChanged: false
      },
      {
        filename: 'src/lo/deep/index.js',
        content: 'lo-deep-index',
        isChanged: false
      },
    ]
  };

  const ft = new FileTree(session, bindingEngine);
  ft._updateTree();

  t.deepEqual(ft.tree, [
    {
      filePath: 'src',
      dirPath: '',
      name: 'src',
      isChanged: true,
      files: [
        {
          filePath: 'src/lo',
          dirPath: 'src',
          name: 'lo',
          isChanged: false,
          files: [
            {
              filePath: 'src/lo/deep',
              dirPath: 'src/lo',
              name: 'deep',
              isChanged: false,
              files: [
                {
                  filePath: 'src/lo/deep/index.js',
                  dirPath: 'src/lo/deep',
                  name: 'index.js',
                  isChanged: false,
                  file: {
                    filename: 'src/lo/deep/index.js',
                    content: 'lo-deep-index',
                    isChanged: false
                  }
                }
              ]
            },
            {
              filePath: 'src/lo/index.js',
              dirPath: 'src/lo',
              name: 'index.js',
              isChanged: false,
              file: {
                filename: 'src/lo/index.js',
                content: 'lo-index',
                isChanged: false
              }
            },
            {
              filePath: 'src/lo/bar.js',
              dirPath: 'src/lo',
              name: 'bar.js',
              isChanged: false,
              file: {
                filename: 'src/lo/bar.js',
                content: 'lo-bar',
                isChanged: false
              }
            }
          ]
        },
        {
          filePath: 'src/foo',
          dirPath: 'src',
          name: 'foo',
          isChanged: true,
          files: [
            {
              filePath: 'src/foo/index.js',
              dirPath: 'src/foo',
              name: 'index.js',
              isChanged: true,
              file: {
                filename: 'src/foo/index.js',
                content: 'foo-index',
                isChanged: true
              }
            },
            {
              filePath: 'src/foo/bar.js',
              dirPath: 'src/foo',
              name: 'bar.js',
              isChanged: false,
              file: {
                filename: 'src/foo/bar.js',
                content: 'foo-bar',
                isChanged: false
              }
            }
          ]
        },
        {
          filePath: 'src/main.js',
          dirPath: 'src',
          name: 'main.js',
          isChanged: false,
          file: {
            filename: 'src/main.js',
            content: 'main',
            isChanged: false
          }
        }
      ]
    },
    {
      filePath: 'index.html',
      dirPath: '',
      name: 'index.html',
      isChanged: false,
      file: {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      }
    }
  ]);
  t.end();
});

test('FileTree generates deep tree with isChanged flags case 2', t => {
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main',
        isChanged: false
      },
      {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      },
      {
        filename: 'src/foo/index.js',
        content: 'foo-index',
        isChanged: false
      },
      {
        filename: 'src/foo/bar.js',
        content: 'foo-bar',
        isChanged: false
      },
      {
        filename: 'src/lo/index.js',
        content: 'lo-index',
        isChanged: false
      },
      {
        filename: 'src/lo/bar.js',
        content: 'lo-bar',
        isChanged: false
      },
      {
        filename: 'src/lo/deep/index.js',
        content: 'lo-deep-index',
        isChanged: true
      },
    ]
  };

  const ft = new FileTree(session, bindingEngine);
  ft._updateTree();

  t.deepEqual(ft.tree, [
    {
      filePath: 'src',
      dirPath: '',
      name: 'src',
      isChanged: true,
      files: [
        {
          filePath: 'src/lo',
          dirPath: 'src',
          name: 'lo',
          isChanged: true,
          files: [
            {
              filePath: 'src/lo/deep',
              dirPath: 'src/lo',
              name: 'deep',
              isChanged: true,
              files: [
                {
                  filePath: 'src/lo/deep/index.js',
                  dirPath: 'src/lo/deep',
                  name: 'index.js',
                  isChanged: true,
                  file: {
                    filename: 'src/lo/deep/index.js',
                    content: 'lo-deep-index',
                    isChanged: true
                  }
                }
              ]
            },
            {
              filePath: 'src/lo/index.js',
              dirPath: 'src/lo',
              name: 'index.js',
              isChanged: false,
              file: {
                filename: 'src/lo/index.js',
                content: 'lo-index',
                isChanged: false
              }
            },
            {
              filePath: 'src/lo/bar.js',
              dirPath: 'src/lo',
              name: 'bar.js',
              isChanged: false,
              file: {
                filename: 'src/lo/bar.js',
                content: 'lo-bar',
                isChanged: false
              }
            }
          ]
        },
        {
          filePath: 'src/foo',
          dirPath: 'src',
          name: 'foo',
          isChanged: false,
          files: [
            {
              filePath: 'src/foo/index.js',
              dirPath: 'src/foo',
              name: 'index.js',
              isChanged: false,
              file: {
                filename: 'src/foo/index.js',
                content: 'foo-index',
                isChanged: false
              }
            },
            {
              filePath: 'src/foo/bar.js',
              dirPath: 'src/foo',
              name: 'bar.js',
              isChanged: false,
              file: {
                filename: 'src/foo/bar.js',
                content: 'foo-bar',
                isChanged: false
              }
            }
          ]
        },
        {
          filePath: 'src/main.js',
          dirPath: 'src',
          name: 'main.js',
          isChanged: false,
          file: {
            filename: 'src/main.js',
            content: 'main',
            isChanged: false
          }
        }
      ]
    },
    {
      filePath: 'index.html',
      dirPath: '',
      name: 'index.html',
      isChanged: false,
      file: {
        filename: 'index.html',
        content: 'index-html',
        isChanged: false
      }
    }
  ]);
  t.end();
});
