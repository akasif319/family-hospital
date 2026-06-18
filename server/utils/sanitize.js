function stripTags(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

function sanitizeStr(value) {
    if (typeof value !== 'string') return value;
    return stripTags(value).trim().replace(/\s+/g, ' ');
}

function deepSanitize(obj) {
    if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
    }
    if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) continue;
            result[key] = deepSanitize(obj[key]);
        }
        return result;
    }
    if (typeof obj === 'string') return sanitizeStr(obj);
    return obj;
}

function exceedsLength(str, max) {
    return typeof str === 'string' && str.length > max;
}

module.exports = { stripTags, sanitizeStr, deepSanitize, exceedsLength };
