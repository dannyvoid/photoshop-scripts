try {
    // Ensure there is an open document
    if (!app.documents.length) {
        alert("No document open. Please open one and try again.");
        throw new Error("No active document");
    }
    
    var doc = app.activeDocument;
    
    // Check if the source image is exactly 3000x3000px at 300dpi
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

    // Paste clipboard content and flatten
    newDoc.paste();
    newDoc.flatten();

    // Ensure 8-bit mode
    newDoc.bitsPerChannel = BitsPerChannelType.EIGHT;

    // Prompt for filename and validate it
    var filename = prompt("Enter a filename (without extension):", "MyImage");
    if (filename) {

        var saveFolder = Folder.selectDialog("Select a folder to save your images");

        if (saveFolder) {
            var jpgSaveOptions = new JPEGSaveOptions();
            jpgSaveOptions.quality = 11; // Compressed quality for DistroKid limit

            // Save as the original size (3000x3000, 300dpi) JPG
            var jpg300 = new File(saveFolder + "/" + filename + "_uncompressed_3000x3000.jpg");
            newDoc.saveAs(jpg300, jpgSaveOptions, true);

            // Resize to 1080x1080, 72dpi for social media
            newDoc.resizeImage(UnitValue(1080, "px"), UnitValue(1080, "px"), 72, ResampleMethod.AUTOMATIC);
            var jpg1080 = new File(saveFolder + "/" + filename + "_social-media_1080x1080.jpg");
            newDoc.saveAs(jpg1080, jpgSaveOptions, true);

            // Close the temporary document without saving changes
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
