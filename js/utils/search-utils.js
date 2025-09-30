/**
 * Search Utilities Module
 * Provides intelligent search and scoring functionality
 */

/**
 * Scores a match between query and text
 * Higher score = better match
 * @param {string} query - Search query
 * @param {string} text - Text to match against
 * @returns {number} Match score
 */
function scoreMatch(query, text) {
    if (!query) return 0;
    
    query = query.toLowerCase();
    text = text.toLowerCase();

    // Exact match - highest score
    if (text === query) return 1000;
    
    // Starts with query - very high score
    if (text.startsWith(query)) return 900 - (text.length - query.length);
    
    // Contains query - high score
    if (text.includes(query)) return 700 - (text.length - query.length);

    // Subsequence match (order preserved)
    let qi = 0, ti = 0, matched = 0;
    while (qi < query.length && ti < text.length) {
        if (query[qi] === text[ti]) { 
            matched++; 
            qi++; 
            ti++; 
        } else {
            ti++;
        }
    }
    if (matched > 0) return 300 + matched * 10;

    // Fuzzy: longest common substring
    let maxCommon = 0;
    for (let i = 0; i < text.length; i++) {
        for (let j = i + 1; j <= text.length; j++) {
            const sub = text.slice(i, j);
            if (query.includes(sub) && sub.length > maxCommon) {
                maxCommon = sub.length;
            }
        }
    }
    if (maxCommon > 0) return 200 + maxCommon * 10;

    return 0;
}
