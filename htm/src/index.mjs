import htm from 'htm';

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

const parse = (text) => {
    let count = -1;
    let inFrontmatter = false;
    let frontmatter = '';
    let pos = [];
    let str = '';

    let statics = [];
    let fields = [];

    for (let i = 0; i < text.length - 1; i++) {
        let ch = text[i];
        if (ch === '-' && text[i + 1] === '-' && text[i + 2] === '-') {
            inFrontmatter = !inFrontmatter;
            i += 2;
            continue;
        }
        if (inFrontmatter) {
            frontmatter += ch;
        }
        if (ch === '{') {
            count++;
            if (count === 0) {
                pos[0] = i + 1;
                statics.push(str);
                str = '';
            }
        } else if (ch === '}') {
            if (count === 0) {
                pos[1] = i;
                fields.push(text.slice(...pos));
                pos = [];
            }
            count--;
        } else if (count < 0 && !inFrontmatter) {
            str += ch
        }
        if (i === text.length - 2) {
            statics.push(str);
        }
    }

    const evalInterpolation = (interpolated) => {
        return new Function(`${frontmatter}; return (() => { return ${interpolated}})()`)();
    }

    const h = (tag, props, ...children) => {
        if (/^[A-Z]/.test(tag)) {
            return { tag: evalInterpolation(tag), props, children }
        }
        return { tag, props, children }
    }

    return htm.bind(h).apply(null, [statics, ...fields.map(interpolated => evalInterpolation(interpolated))]);
}

const normalizeProps = props => {
    if (!props) return '';
    let str = '';
    for (let [key, value] of Object.entries(props)) {
        if (value === false || value === null || value === undefined || typeof value === 'function') continue;
        if (typeof value === 'object') value = JSON.stringify(value);
        str += ` ${key}="${value}"`;
    }
    return str;
}

export const renderToString = (built) => {
    return Array.isArray(built) ? built.map((value) => {
        if (typeof value === 'object') {
            const { tag, props, children } = value;
            if (VOID_ELEMENTS.test(tag)) return `<${tag}${normalizeProps(props)}>`;
            return `<${tag}${normalizeProps(props)}>${renderToString(children)}</${tag}>`;
        } else if (typeof value === 'string') {
            return value;
        }
    }).join('\n') : renderToString([built]);
}

export default parse;
