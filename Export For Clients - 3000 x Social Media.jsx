try {
    if (!app.documents.length) {
        alert("No document open. Please open one and try again.");
        throw new Error("No active document");
    }

    var doc = app.activeDocument;

    if (doc.width.as("px") !== 3000 || doc.height.as("px") !== 3000 || doc.resolution !== 300) {
        alert("Source image must be 3000x3000 at 300dpi. Please adjust your image and try again.");
        throw new Error("Invalid source dimensions");
    }

    // Select all (Ctrl + A) and Copy Merged (Ctrl + Shift + C)
    doc.selection.selectAll();
    var idcopyMerged = stringIDToTypeID("copyMerged");
    executeAction(idcopyMerged, undefined, DialogModes.NO);

    // Create a new document with clipboard dimensions
    var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "Exported Image", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    app.activeDocument = newDoc;

    newDoc.paste();
    newDoc.flatten();
    newDoc.bitsPerChannel = BitsPerChannelType.EIGHT;

    var filename = prompt("Enter a filename (without extension):", "MyImage");
    if (filename) {

        var saveFolder = Folder.selectDialog("Select a folder to save your images");

        if (saveFolder) {
            var jpgSaveOptionsHigh = new JPEGSaveOptions();
            jpgSaveOptionsHigh.quality = 11; // Lower quality for the 3000x3000 image

            var jpgSaveOptionsFull = new JPEGSaveOptions();
            jpgSaveOptionsFull.quality = 12; // Full quality for the 1080x1080 image

            var jpg300 = new File(saveFolder + "/" + filename + "_uncompressed_3000x3000.jpg");
            newDoc.saveAs(jpg300, jpgSaveOptionsHigh, true);

            newDoc.resizeImage(UnitValue(1080, "px"), UnitValue(1080, "px"), 72, ResampleMethod.AUTOMATIC);
            var jpg1080 = new File(saveFolder + "/" + filename + "_social-media_1080x1080.jpg");
            newDoc.saveAs(jpg1080, jpgSaveOptionsFull, true); // Use full quality here

            newDoc.close(SaveOptions.DONOTSAVECHANGES);
            alert("Files saved successfully!");
        } else {
            alert("No folder selected. Process canceled.");
            newDoc.close(SaveOptions.DONOTSAVECHANGES);
        }
    } else {
        alert("No filename entered. Process canceled.");
        newDoc.close(SaveOptions.DONOTSAVECHANGES);
    }
} catch (e) {
    alert("An error occurred: " + e.message);
}
