const Parser = require('tree-sitter');

const parsers = {};

const LANG_ALIASES = {
    ts: 'ts', tsx: 'tsx', typescript: 'ts',
    js: 'js', jsx: 'jsx', javascript: 'js',
    py: 'py', python: 'py'
};

function getParser(lang) {
    const normalized = LANG_ALIASES[lang];
    if (!normalized) return null;
    if (parsers[normalized]) return parsers[normalized];

    const parser = new Parser();
    if (normalized === 'tsx') {
        parser.setLanguage(require('tree-sitter-typescript').tsx);
    } else if (normalized === 'ts') {
        parser.setLanguage(require('tree-sitter-typescript').typescript);
    } else if (normalized === 'js' || normalized === 'jsx') {
        parser.setLanguage(require('tree-sitter-javascript'));
    } else if (normalized === 'py') {
        parser.setLanguage(require('tree-sitter-python'));
    }

    parsers[normalized] = parser;
    return parser;
}

function extractAst(code, lang) {
    try {
        const parser = getParser(lang);
        if (!parser) return { status: 'failed' };
        
        const tree = parser.parse(code);
        const imports = [];
        const exports = [];
        
        // Shallow traversal of top-level nodes only
        for (const node of tree.rootNode.children) {
            if (node.type === 'import_statement' || node.type === 'import_from_statement') {
                const source = node.children.find(c => c.type === 'string');
                if (source) imports.push(source.text.replace(/['"]/g, ''));
            }
            if (node.type === 'export_statement') {
                const dec = node.children.find(c => c.type === 'lexical_declaration' || c.type === 'variable_declaration');
                if (dec) {
                    const id = dec.children.find(c => c.type === 'variable_declarator');
                    if (id && id.children[0]) exports.push(id.children[0].text);
                }
            }
        }

        return { status: 'success', imports, exports };
    } catch (e) {
        return { status: 'failed', error: e.message };
    }
}

module.exports = { extractAst };