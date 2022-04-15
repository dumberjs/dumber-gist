// Fill up process.version.
// Newest babel uses it for builtin modules check.
// dumber v2.0 will fill up them automatically,
// but for now, patch it for dumber v1.
process.version = 'v14.18.1';
process.versions = {
	node: '14.18.1'
};
process.execArgv = [];
