document.addEventListener('DOMContentLoaded', () => {

    const DEFAULTS = { isEnabled: true, offset: 0, fontSize: 32, color: "#FFFFFF", styleMode: "classic" };


    const powerBtn = document.getElementById('powerBtn');
    const songTitle = document.getElementById('songTitle');
    const offsetSlider = document.getElementById('offsetSlider');
    const sizeSlider = document.getElementById('sizeSlider');
    const offsetVal = document.getElementById('offsetVal');
    const sizeVal = document.getElementById('sizeVal');
    const swatches = document.querySelectorAll('.swatch');




    const modeClassic = document.getElementById('modeClassic');
    const modeBoxed = document.getElementById('modeBoxed');




    chrome.storage.sync.get(['isEnabled', 'offset', 'fontSize', 'color', 'styleMode'], (data) => {
        updatePowerState(data.isEnabled !== false);

        const offset = data.offset ?? DEFAULTS.offset;
        offsetSlider.value = offset;
        offsetVal.innerText = (offset > 0 ? "+" : "") + offset + "s";

        const size = data.fontSize ?? DEFAULTS.fontSize;
        sizeSlider.value = size;
        sizeVal.innerText = size + "px";

        const color = data.color ?? DEFAULTS.color;
        highlightSwatch(color);

        const mode = data.styleMode ?? DEFAULTS.styleMode;
        updateModeUI(mode);

        sendToContent("PING", {}, (res) => {
            if (res && res.trackName) songTitle.innerText = res.trackName;
        });
    });




    powerBtn.addEventListener('click', () => {
        const isActive = powerBtn.classList.contains('active');
        updatePowerState(!isActive);
        save({ isEnabled: !isActive }, "UPDATE_STATE");
    });




    function updatePowerState(isOn) {
        if (isOn) powerBtn.classList.add('active');
        else powerBtn.classList.remove('active');
    }



    function updateModeUI(mode) {
        if (mode === 'boxed') {
            modeBoxed.classList.add('active');
            modeClassic.classList.remove('active');
        } else {
            modeClassic.classList.add('active');
            modeBoxed.classList.remove('active');
        }
    }


    modeClassic.addEventListener('click', () => {
        updateModeUI('classic');
        save({ styleMode: 'classic' });
    });


    modeBoxed.addEventListener('click', () => {
        updateModeUI('boxed');
        save({ styleMode: 'boxed' });
    });




    offsetSlider.addEventListener('input', () => {
        const val = parseFloat(offsetSlider.value);
        offsetVal.innerText = (val > 0 ? "+" : "") + val + "s";
        sendToContent("UPDATE_SETTINGS", { offset: val });
    });
    offsetSlider.addEventListener('change', () => save({ offset: parseFloat(offsetSlider.value) }));

    sizeSlider.addEventListener('input', () => {
        const val = parseInt(sizeSlider.value);
        sizeVal.innerText = val + "px";
        sendToContent("UPDATE_SETTINGS", { fontSize: val });
    });
    sizeSlider.addEventListener('change', () => save({ fontSize: parseInt(sizeSlider.value) }));






    document.getElementById('resetOffset').addEventListener('click', () => {
        offsetSlider.value = DEFAULTS.offset;
        offsetVal.innerText = "0.0s";
        save({ offset: DEFAULTS.offset });
    });
    document.getElementById('resetSize').addEventListener('click', () => {
        sizeSlider.value = DEFAULTS.fontSize;
        sizeVal.innerText = DEFAULTS.fontSize + "px";
        save({ fontSize: DEFAULTS.fontSize });
    });






    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.getAttribute('data-color');
            highlightSwatch(color);
            save({ color: color });
        });
    });

    function highlightSwatch(color) {
        swatches.forEach(s => {
            if (s.getAttribute('data-color') === color) s.classList.add('selected');
            else s.classList.remove('selected');
        });
    }






    function save(data, action = "UPDATE_SETTINGS") {
        chrome.storage.sync.set(data);
        sendToContent(action, data);
    }

    function sendToContent(action, data, cb) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action, ...data }, cb);
            }
        });
    }






    const githubLink = document.getElementById('githubLink');
    if (githubLink) {
        githubLink.addEventListener('click', () => {

            chrome.tabs.create({ url: 'https://github.com/Maadalla' });
        });
    }
});