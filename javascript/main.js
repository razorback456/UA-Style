function when_loaded() {
    document.getElementById('style_editor_grid').addEventListener('keydown', function(event){
        if (event.ctrlKey === true) {
            event.stopImmediatePropagation();
            span = event.target.querySelector("span");
            if (event.key === 'c') {
                navigator.clipboard.writeText(span.textContent);
            }
            if (event.key === 'x') {
                navigator.clipboard.writeText(span.textContent);
                update(event.target, "");
            }
            if (event.key === 'v') {
                navigator.clipboard.readText().then((clipText) => (update(event.target,clipText)));
            }
        }

        // if a key is pressed in a TD which has an INPUT child, or an INPUT, this is typing in a cell, allow it
        if (event.target.tagName === 'TD' && event.target.querySelector("input")) { return; }
        if (event.target.tagName === 'INPUT') { return; }

        // if backspace or delete are pressed, and we're over the selected row, delete it
        if (event.key === "Backspace" || event.key === "Delete") { 
            if (event.target.closest("tr") === globalThis.selectedRow) { update(globalThis.selectedRow.querySelector("td"),"!!!"); }
        } 

        // if we get to here, stop the keypress from propogating
        event.stopImmediatePropagation(); 
    }, { capture: true });

    document.getElementById('style_editor_grid').addEventListener('contextmenu', function(event){
        if(event.shiftKey) { return; }
        unselect_row();    
        row = event.target.closest("tr");
        if (row) { select_row(row); event.stopImmediatePropagation(); event.preventDefault(); }  
    }, { capture: true });

    document.getElementById('style_editor_grid').addEventListener('click', function(event){
        if (event.target == document.getElementById('style_editor_grid').querySelector("span.button-wrap").querySelector("button") && globalThis.selectedRow) {
            settimeout( function() {
                p  = globalThis.selectedRow.querySelectorAll("span")[2].textContent;
                np = globalThis.selectedRow.querySelectorAll("span")[3].textContent;
                newRow = document.getElementById('style_editor_grid').querySelector("table").querySelectorAll("tr").slice(-1)[0];
                update(newRow.querySelectorAll("td")[2], p);
                update(newRow.querySelectorAll("td")[3], np);
            }, 100)
            // wait 100ms then past from selected row to the new row (last)
        } else {
            unselect_row();
        }
    }, { capture: true });

}

function select_row(row) {
    globalThis.savedStyle = row.style;
    globalThis.selectedRow = row;
    row.style.backgroundColor = "#840";
}

function unselect_row() {
    if (globalThis.selectedRow) {
        globalThis.selectedRow.style = globalThis.savedStyle;
        globalThis.selectedRow = null;
    }
}

function press_refresh_button(tab) {
    b = document.getElementById("refresh_txt2img_styles");
    if (b) {b.click()}
    b = document.getElementById("refresh_img2img_styles");
    if (b) {b.click()}
}

function update(target, text) { 
    // Update the cell in such a way as to get the backend to notice...
    // - generate a double click on the original target
    // - wait 10ms to make sure it has happened, then:
    //   - paste the text into the input that has been created
    //   - send a 'return' keydown event through the input
    const dblclk = new MouseEvent("dblclick", {"bubbles":true, "cancelable":true});
    target.dispatchEvent(dblclk);
    setTimeout( function() {
        const the_input = target.querySelector('input');
        the_input.value = text;
        const rtrn = new KeyboardEvent( "keydown", {
            'key': 'Enter', 'target': the_input,
            'view': window, 'bubbles': true, 'cancelable': true            
        });
        the_input.dispatchEvent(rtrn);
    }, 10);
}

function filter_style_list(filter_text, type) {
    if (type=="regex") { 
        filter = document.getElementById('style_editor_filter').firstElementChild.lastElementChild;
        try {
            re = new RegExp(filter_text);
            filter.style.color="white";
        } 
        catch (error) { 
            re = new RegExp();
            filter.style.color="red";
        } 
    }
    rows = document.getElementById('style_editor_grid').querySelectorAll("tr");
    header = true;
    for (row of rows) {
        vis = false;
        for (cell of row.querySelectorAll("span")) {
            if ( (type=="Exact match" && cell.textContent.includes(filter_text)) ||
                 (type=="Case insensitive" && cell.textContent.toLowerCase().includes(filter_text.toLowerCase())) ||
                 (type=="regex" && cell.textContent.match(re)) )
                { vis = true; };
        }
        if (vis || header) { row.style.display = '' } else { row.style.display='none' }
        header = false;
    }
    return (filter_text, type);
}

function new_style_file_dialog(x) {
    let filename = prompt("New style filename", "");
    if (filename == null) { filename = "" }
    return filename;
}
