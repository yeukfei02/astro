import htm from 'htm';

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

const parse = (text) => {
    let buffer = '';

    let braceCount = -1;
    let fieldsPos = [];
    let inFrontmatter = false;
    let frontmatter = '';

    // Statics are all the markup before and after an interpolated { ... } section
    let statics = [];
    
    // Interpolations are the contents of an interpolated { ... } section
    let interpolations = [];

    // Having `statics` and `interpolations` matches the signature of a tagged template literal
    // htm`<div>${content}</div>` => htm(['<div>', '</div>'], [content])

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
            // braceCount > 0 means we're seeing "{" inside an interpolated section
            braceCount++;
            // braceCount === 0 means we're entering an interpolated section
            if (braceCount === 0) {
                fieldsPos[0] = i + 1;
                statics.push(buffer);
                buffer = '';
            }
        } else if (ch === '}') {
            // braceCount === 0 means we're closing out an interpolated section
            if (braceCount === 0) {
                fieldsPos[1] = i;
                interpolations.push(text.slice(...fieldsPos));
                fieldsPos = [];
            }
            // braceCount > 0 means we're seeing "}" inside an interpolated section
            braceCount--;
        } else if (braceCount < 0 && !inFrontmatter) {
            // track the file contents outside of an interpolated section in a temporary buffer
            buffer += ch
        }
        
        // End of file, push `buffer` to `statics`
        if (i === text.length - 2) {
            statics.push(buffer);
        }
    }

    const evalInterpolation = (i) => {
        return new Function(`${frontmatter}; return (() => { return ${i}})()`)();
    }

    // Custom `h` function to return an AST from `htm`
    const h = (tag, props, ...children) => {
        if (/^[A-Z]/.test(tag)) {
            return { tag: evalInterpolation(tag), props, children }
        }
        return { tag, props, children }
    }

    // `htm` does pretty much all the heavy lifting here
    return htm.bind(h).apply(null, [statics, ...interpolations.map(i => evalInterpolation(i))]);
}

const serializeProps = props => {
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
    if (Array.isArray(built)) {
        return built.map((value) => {
            if (typeof value === 'object') {
                const { tag, props, children } = value;
                if (VOID_ELEMENTS.test(tag)) return `<${tag}${serializeProps(props)}>`;
                return `<${tag}${serializeProps(props)}>${renderToString(children)}</${tag}>`;
            }

            return value;
        }).join('\n')
    }

    return renderToString([built]);
}

export default parse;
