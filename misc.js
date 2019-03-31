const copyToClipboard = id => {
    var editor = ace.edit(id);
    var sel = editor.selection.toJSON(); // save selection
    editor.selectAll();
    editor.focus();
    document.execCommand('copy');
    editor.selection.fromJSON(sel); // restore selection
};