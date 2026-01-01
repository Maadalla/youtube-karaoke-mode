(async function initLyricsExtension() {
    let SETTINGS = {
        enabled: true,
        baseOffset: 0.5,
        userOffset: 0,
        fontSize: 32,
        color: "#FFFFFF",
        styleMode: "classic",
        durationFuzziness: 10,
        position: { x: 0, y: 0 }
    };
    let currentTrackName = "No Song Detected";
    let currentLyrics = [];
    let isInstrumental = false;
    let dragObj = { active: false, currentX: 0, currentY: 0, initialX: 0, initialY: 0 };

    console.log("🚀 Lyric Extension: V4.2 Final UI Loaded");

    // --- HELPER: TEXT CLEANERS ---
    function cleanArtistName(raw) {
        if (!raw) return "";
        return raw
            .replace(/VEVO$/i, '')
            .replace(/Official$/i, '')
            .replace(/ ?- ?Topic$/i, '')
            .trim();
    }

    function cleanTrackTitle(raw) {
        if (!raw) return "";
        return raw
            .replace(/\(.*?\)|\[.*?\]/g, '')
            .replace(/ft\..*/i, '')
            .replace(/feat\..*/i, '')
            .replace(/official video/gi, '')
            .replace(/clip officiel/gi, '')
            .replace(/lyric video/gi, '')
            .replace(/[|•-]/g, ' ')
            .trim();
    }

    // --- LISTENERS ---
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === "PING") sendResponse({ trackName: currentTrackName });
        else if (msg.action === "UPDATE_SETTINGS") {
            if (msg.offset !== undefined) SETTINGS.userOffset = msg.offset;
            if (msg.fontSize !== undefined) SETTINGS.fontSize = msg.fontSize;
            if (msg.color !== undefined) SETTINGS.color = msg.color;
            if (msg.styleMode !== undefined) SETTINGS.styleMode = msg.styleMode;
            updateStyles();
        }
        else if (msg.action === "UPDATE_STATE") {
            SETTINGS.enabled = msg.isEnabled;
            updateVisibility();
        }
        return true;
    });

    chrome.storage.sync.get(['isEnabled', 'offset', 'fontSize', 'color', 'styleMode', 'position'], (data) => {
        if (data.isEnabled !== undefined) SETTINGS.enabled = data.isEnabled;
        if (data.offset !== undefined) SETTINGS.userOffset = data.offset;
        if (data.fontSize !== undefined) SETTINGS.fontSize = data.fontSize;
        if (data.color !== undefined) SETTINGS.color = data.color;
        if (data.styleMode !== undefined) SETTINGS.styleMode = data.styleMode;
        if (data.position !== undefined) SETTINGS.position = data.position;
        updateVisibility();
        updateStyles();
    });

    // --- UI INJECTOR ---
    function injectUI() {
        const player = document.getElementById('movie_player');
        if (!player) return false;
        if (document.getElementById('my-lyric-overlay')) return true;

        const overlay = document.createElement('div');
        overlay.id = 'my-lyric-overlay';

        // Restore Saved Position
        const initialTransform = `translate(calc(-50% + ${SETTINGS.position.x}px), calc(-50% + ${SETTINGS.position.y}px))`;
        dragObj.currentX = SETTINGS.position.x;
        dragObj.currentY = SETTINGS.position.y;

        Object.assign(overlay.style, {
            position: 'absolute',
            top: '80%', left: '50%',
            transform: initialTransform,
            width: 'auto', minWidth: '300px', maxWidth: '80%',
            textAlign: 'center', zIndex: '2000',
            cursor: 'grab', userSelect: 'none', pointerEvents: 'auto',
            display: SETTINGS.enabled ? 'flex' : 'none',
            flexDirection: 'column', alignItems: 'center',
            transition: 'background-color 0.3s ease, padding 0.3s ease'
        });

        overlay.innerHTML = `
            <div id="lyric-current" style="font-family:'YouTube Noto',Roboto,Arial; font-weight:700; text-shadow:2px 2px 4px rgba(0,0,0,0.8); transition:transform 0.1s; line-height:1.2;"></div>
            <div id="lyric-next" style="font-family:'YouTube Noto',Roboto,Arial; font-weight:500; color:#cccccc; opacity:0.7; margin-top:8px; transition:all 0.2s;"></div>
        `;

        overlay.addEventListener("mousedown", dragStart);
        document.addEventListener("mouseup", dragEnd);
        document.addEventListener("mousemove", drag);
        player.appendChild(overlay);
        updateStyles();
        return true;
    }

    // --- STYLES ---
    function updateStyles() {
        const overlay = document.getElementById('my-lyric-overlay');
        const currentEl = document.getElementById('lyric-current');
        const nextEl = document.getElementById('lyric-next');
        if (!overlay || !currentEl) return;

        currentEl.style.fontSize = `${SETTINGS.fontSize}px`;
        currentEl.style.color = SETTINGS.color;
        nextEl.style.fontSize = `${Math.max(14, SETTINGS.fontSize * 0.6)}px`;

        if (SETTINGS.styleMode === 'boxed') {
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            overlay.style.backdropFilter = 'blur(4px)';
            overlay.style.padding = '15px 25px';
            overlay.style.borderRadius = '12px';
            nextEl.style.display = 'block';
        } else {
            overlay.style.backgroundColor = 'transparent';
            overlay.style.backdropFilter = 'none';
            overlay.style.padding = '5px';
            overlay.style.borderRadius = '0';
            nextEl.style.display = 'none';
        }
    }

    // --- DRAG LOGIC ---
    function dragStart(e) {
        if (e.target.closest('#my-lyric-overlay')) {
            dragObj.initialX = e.clientX - dragObj.currentX;
            dragObj.initialY = e.clientY - dragObj.currentY;
            dragObj.active = true;
            document.getElementById('my-lyric-overlay').style.cursor = 'grabbing';
        }
    }
    function dragEnd(e) {
        if (dragObj.active) {
            dragObj.active = false;
            document.getElementById('my-lyric-overlay').style.cursor = 'grab';
            chrome.storage.sync.set({ position: { x: dragObj.currentX, y: dragObj.currentY } });
        }
    }
    function drag(e) {
        if (dragObj.active) {
            e.preventDefault();
            dragObj.currentX = e.clientX - dragObj.initialX;
            dragObj.currentY = e.clientY - dragObj.initialY;
            const o = document.getElementById('my-lyric-overlay');
            o.style.transform = `translate(calc(-50% + ${dragObj.currentX}px), calc(-50% + ${dragObj.currentY}px))`;
        }
    }

    // --- HELPERS ---
    function updateVisibility() {
        const o = document.getElementById('my-lyric-overlay');
        if (o) o.style.display = SETTINGS.enabled ? 'flex' : 'none';
    }

    function getVideoDuration() {
        const d = document.querySelector('.ytp-time-duration');
        if (!d) return 0;
        const p = d.innerText.split(':').reverse();
        return (parseInt(p[0] || 0) + (parseInt(p[1] || 0) * 60) + (parseInt(p[2] || 0) * 3600));
    }

    // --- SMART SEARCH ENGINE ---
    async function loadLyricsForCurrentVideo() {
        const overlay = document.getElementById('my-lyric-overlay');
        if (!overlay) return;

        // Reset UI
        document.getElementById('lyric-current').innerText = "";
        document.getElementById('lyric-next').innerText = "";
        overlay.style.opacity = "0";
        currentLyrics = [];
        isInstrumental = false;

        const videoDuration = getVideoDuration();
        let searchQuery = "";

        // --- STRATEGY 1: Media Session API ---
        if (navigator.mediaSession && navigator.mediaSession.metadata) {
            const rawArtist = navigator.mediaSession.metadata.artist || "";
            const rawTrack = navigator.mediaSession.metadata.title || "";

            const metaArtist = cleanArtistName(rawArtist);
            const metaTrack = cleanTrackTitle(rawTrack);

            if (metaTrack) {
                if (metaTrack.toLowerCase().includes(metaArtist.toLowerCase())) {
                    searchQuery = metaTrack;
                } else {
                    searchQuery = `${metaArtist} ${metaTrack}`;
                }
                console.log(`🎵 Source: MediaSession -> "${searchQuery}"`);
            }
        }

        // --- STRATEGY 2: DOM Scraping ---
        if (!searchQuery) {
            const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
            const channelEl = document.querySelector('#owner #channel-name a');

            if (!titleEl) { currentTrackName = "No Video"; return; }

            const rawTitle = titleEl.innerText;
            const rawChannel = channelEl ? channelEl.innerText : "";

            const cleanTitle = cleanTrackTitle(rawTitle);
            const cleanChannel = cleanArtistName(rawChannel);

            if (cleanTitle.toLowerCase().includes(cleanChannel.toLowerCase())) {
                searchQuery = cleanTitle;
            } else {
                searchQuery = `${cleanChannel} ${cleanTitle}`;
            }
            console.log(`🔧 Source: DOM Scraper -> "${searchQuery}"`);
        }

        searchQuery = searchQuery.replace(/\s+/g, ' ').trim();
        currentTrackName = searchQuery;

        try {
            if (SETTINGS.enabled) {
                document.getElementById('lyric-current').innerText = "Starting...";
                overlay.style.opacity = "1";
            }

            // --- API CALL ---
            const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            let candidates = data.filter(i => i.syncedLyrics || i.instrumental);

            if (candidates.length === 0) {
                if (SETTINGS.enabled) document.getElementById('lyric-current').innerText = "";
                overlay.style.opacity = "0";
                return;
            }

            // --- SMART SELECTION ---
            let bestMatch = null;
            let smallestDiff = 9999;

            candidates.forEach(candidate => {
                const diff = Math.abs(candidate.duration - videoDuration);
                if (diff < smallestDiff) { smallestDiff = diff; bestMatch = candidate; }
            });

            console.log(`✅ Selected: "${bestMatch.trackName}" by ${bestMatch.artistName} (Diff: ${smallestDiff}s)`);

            if (bestMatch.instrumental) {
                isInstrumental = true;
                if (SETTINGS.enabled) {
                    document.getElementById('lyric-current').innerText = "🎵 Instrumental 🎵";
                    overlay.style.opacity = "1";
                }
                return;
            }

            currentLyrics = bestMatch.syncedLyrics.split('\n').map(l => {
                const m = l.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
                return m ? { time: parseFloat(m[1]) * 60 + parseFloat(m[2]), text: m[3].trim() } : null;
            }).filter(x => x);

            if (SETTINGS.enabled) {
                document.getElementById('lyric-current').innerText = "🎵 Lyrics Ready";
                setTimeout(() => {
                    if (document.getElementById('lyric-current').innerText.includes("Ready")) {
                        document.getElementById('lyric-current').innerText = "";
                    }
                }, 1500);
            }
        } catch (e) { console.error(e); overlay.style.opacity = "0"; }
    }

    // --- SYNC LOOP ---
    function syncLoop() {
        const video = document.querySelector('video');
        const overlay = document.getElementById('my-lyric-overlay');
        const currentEl = document.getElementById('lyric-current');
        const nextEl = document.getElementById('lyric-next');
        const player = document.getElementById('movie_player');

        // Ad Detection
        if (player && player.classList.contains('ad-interrupting')) {
            if (overlay.style.display !== 'none') overlay.style.display = 'none';
            requestAnimationFrame(syncLoop);
            return;
        } else {
            if (SETTINGS.enabled && overlay.style.display === 'none') overlay.style.display = 'flex';
        }

        if (video && currentEl && currentLyrics.length && SETTINGS.enabled && !isInstrumental) {
            const t = video.currentTime + SETTINGS.baseOffset + SETTINGS.userOffset;
            let idx = -1;

            for (let i = currentLyrics.length - 1; i >= 0; i--) {
                if (currentLyrics[i].time <= t) { idx = i; break; }
            }

            if (idx !== -1) {
                const currentLine = currentLyrics[idx];
                const nextLine = currentLyrics[idx + 1];

                if (currentEl.innerText !== currentLine.text) {
                    currentEl.innerText = currentLine.text;
                    if (!dragObj.active) {
                        currentEl.style.transform = "scale(1.05)";
                        setTimeout(() => currentEl.style.transform = "scale(1)", 100);
                    }
                }

                if (nextLine) nextEl.innerText = nextLine.text;
                else nextEl.innerText = "";

                overlay.style.opacity = "1";
            } else if (t < currentLyrics[0].time) {
                currentEl.innerText = "";
                nextEl.innerText = "";
                if (SETTINGS.styleMode === 'boxed') overlay.style.opacity = "0";
            }
        }
        requestAnimationFrame(syncLoop);
    }


    const wait = setInterval(() => {
        if (injectUI()) {
            clearInterval(wait);
            loadLyricsForCurrentVideo();
            syncLoop();
            const t = document.querySelector('h1.ytd-watch-metadata');
            if (t) new MutationObserver(() => setTimeout(loadLyricsForCurrentVideo, 1000)).observe(t, { childList: true, subtree: true, characterData: true });
        }
    }, 500);

})();