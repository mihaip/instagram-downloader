async function run() {
    try {
        // Find the largest visible image.
        const imageNodes = document.querySelectorAll("img");
        const visibleAreas = await elementVisibleAreas(imageNodes);
        const sortedImageNodes = Array.from(imageNodes).sort((a, b) => {
            return visibleAreas.get(b) - visibleAreas.get(a);
        });
        const imageNode = sortedImageNodes[0];
        let imageUrl;
        // Prefer to use srcset, because we can then get the highest resolution
        // image.
        if (imageNode.srcset) {
            const srcMap = new Map(imageNode.srcset
                .split(",")
                .map(src => src.split(" ").reverse()));
            imageUrl = srcMap.get("1080w");
        } else {
            imageUrl = imageNode.src;
        }

        if (imageUrl) {
            chrome.runtime.sendMessage({
                type: "download",
                url: imageUrl,
                filename: generateFilename(imageNode.alt)
            });
            return;
        }
    } catch (err) {
        console.warn("Could not extract current image, falling back on metadata.", err);
    }

    var imageUrl = document.querySelector("meta[property='og:image']")
        .getAttribute("content");
    var filename;

    try {
        // We can't access the window._sharedData variable directly, since we're in
        // an isolated world. But we can extract the script text and parse it.
        var sharedDataScriptNode = Array.prototype.find.call(
            document.querySelectorAll("script"),
            node => node.textContent.includes("window._sharedData"));
        var sharedDataJson = sharedDataScriptNode.textContent;
        sharedDataJson = sharedDataJson
            .replace(/^window\._sharedData\s*=\s*/, "")
            .replace(/;*\s*$/, "");
        var sharedData = JSON.parse(sharedDataJson);

        var caption = sharedData.entry_data.PostPage[0].media.caption;
        filename = generateFilename(caption);
    } catch (ex) {};

    chrome.runtime.sendMessage({
        type: "download",
        url: imageUrl,
        filename: filename
    });
}

function elementVisibleAreas(elements) {
    return new Promise(resolve => {
        const o = new IntersectionObserver(entries => {
            const result = new Map(entries.map(entry => [
                entry.target,
                entry.intersectionRect.width * entry.intersectionRect.height
            ]));
            o.disconnect();
            resolve(result);
        });
        for (const element of elements) {
            o.observe(element);
        }
    });
}

function generateFilename(caption) {
    // Remove hashtags, question marks and trailing periods.
    caption = caption
        .replace(/#\w+/g, "")
        .trim()
        .replace(/[?:"]/g, "")
        .replace(/\.+$/, "")
        .trim();

    if (caption.length > 200) {
        caption = caption.substring(0, 200);
    }
    if (!caption) {
        caption = "image";
    }
    return caption + ".jpeg";
}

run();
