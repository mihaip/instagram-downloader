chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        schemes: ["https"],
                        hostEquals: "www.instagram.com",
                        pathPrefix: "/p/"
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
        file: "script.js"
    });
});

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.type == "download") {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename,
            saveAs: true
        });
    }
});
