/**
 * Wikipedia Loader Module
 * Fetches and displays Wikipedia summaries
 */

/**
 * Loads Wikipedia information for an element or molecule
 * @param {string} title - Wikipedia article title
 * @param {string} targetElementId - ID of element to display content in
 */
function loadWikipediaInfo(title, targetElementId = 'wikiContent') {
    const wikiEl = document.getElementById(targetElementId);
    if (!wikiEl) return;
    
    wikiEl.innerHTML = '<div class="loading"></div><span>Loading information...</span>';

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
        .then(response => response.json())
        .then(data => {
            if (data.extract) {
                wikiEl.innerHTML = `
                    <p>${data.extract}</p>
                    <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(title)}" 
                       target="_blank" 
                       style="color: var(--accent-blue); text-decoration: none; font-weight: 500;">
                       Read more on Wikipedia →
                    </a>
                `;
            } else {
                wikiEl.innerHTML = '<p>No Wikipedia information available.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading Wikipedia info:', error);
            wikiEl.innerHTML = '<p>Failed to load Wikipedia information.</p>';
        });
}

/**
 * Loads Wikipedia info for matter (molecules)
 * @param {string} wikiTitle - Wikipedia article title
 */
function loadMatterWiki(wikiTitle) {
    loadWikipediaInfo(wikiTitle, 'matterWiki');
}
