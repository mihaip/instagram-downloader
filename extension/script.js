function run() {
    try {
        const imageNode = document.querySelector("img[srcset]");
        const srcMap = new Map(imageNode.srcset
            .split(",")
            .map(src => src.split(" ").reverse()));
        const imageUrl = srcMap.get("1080w");

        chrome.runtime.sendMessage({
            type: "download",
            url: imageUrl,
            filename: generateFilename(imageNode.alt)
        });
        return;
    } catch (err) {
        console.warn("Could not extract current image, falling back on metadata.");
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
    return caption + ".jpeg";
}

run();
