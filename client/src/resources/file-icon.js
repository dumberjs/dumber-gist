import path from 'path';

export class FileIconValueConverter {
  toView(value) {
    if (!value) return 'fa-fw fas fa-file';
    const ext = path.extname(value);
    if (ext === '.html') return 'fa-fw fab fa-html5 text-error';
    if (ext === '.js' || ext === '.ts') return 'fa-fw fab fa-js-square text-warning';
    if (ext === '.jsx' || ext === '.tsx') return 'fa-fw fab fa-react text-warning';
    if (ext === '.json' || ext === '.json5') return 'fa-fw fas fa-file-code text-warning';
    if (ext === '.css' || ext === '.scss' || ext === '.less') return 'fa-fw fab fa-css3 text-success';
    if (ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.ico') return 'fa-fw fas fa-image text-success';
    if (ext === '.svelte') return 'fa-fw fab fa-stripe-s text-error';

    return 'fas fa-file text-primary';
  }
}
