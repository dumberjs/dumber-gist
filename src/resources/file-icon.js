import path from 'path';

export class FileIconValueConverter {
  toView(value) {
    if (!value) return 'fas fa-file';
    const ext = path.extname(value);
    if (ext === '.html') return 'fab fa-html5 text-error';
    if (ext === '.js' || ext === '.ts') return 'fab fa-js-square text-warning';
    if (ext === '.json' || ext === '.json5') return 'fas fa-file-code text-primary';
    if (ext === '.css' || ext === '.scss' || ext === '.less') return 'fab fa-css3 text-primary';
    if (ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.ico') return 'fas fa-image text-success';

    return 'fas fa-file';
  }
}
