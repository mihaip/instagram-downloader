var imageUrl = document.querySelector("meta[property='og:image']").getAttribute("content");
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
    // Remove hashtags, question marks and trailing punctutation.
    caption = caption
        .replace(/#\w+/g, "")
        .trim()
        .replace(/\?/g, "")
        .replace(/[.!]+$/, "")
        .trim();

    filename = caption + ".jpeg";
} catch (ex) {};

chrome.runtime.sendMessage({
    type: "download",
    url: imageUrl,
    filename: filename
});
