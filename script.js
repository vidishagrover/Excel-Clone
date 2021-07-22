function findRowCol(ele) {
    let idArray = $(ele).attr("id").split('-')
    let rowId = parseInt(idArray[1]);
    let colId = parseInt(idArray[3]);
    return [rowId, colId];
}
function calcColName(n){
    let str = "";
    // n = i;

    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            str = 'Z' + str;
            n = Math.floor((n / 26)) - 1;
        } else {
            str = String.fromCharCode((rem - 1) + 65) + str;
            n = Math.floor((n / 26));
        }
    }
    return str;
}

for (let i = 1; i <= 100; i++) {
     let str = calcColName(i);
    // let str = "";
    // let n = i;

    // while (n > 0) {
    //     let rem = n % 26;
    //     if (rem == 0) {
    //         str = 'Z' + str;
    //         n = Math.floor((n / 26)) - 1;
    //     } else {
    //         str = String.fromCharCode((rem - 1) + 65) + str;
    //         n = Math.floor((n / 26));
    //     }
    // }
    $("#columns").append(`<div class="column-name">${str}</div>`);
    $("#rows").append(`<div class="row-name">${i}</div>`);
}
$('#cells').scroll(function () {
    // console.log(this.scrollLeft);
    $('#columns').scrollLeft(this.scrollLeft); //jitna cells move kre utna columns ko bhi move kro
    $('#rows').scrollTop(this.scrollTop);
});
let cellData = { "Sheet1": {} };
let saved = true; 
let totalSheets = 1;
let lastlyAddedSheetNumber = 1;
let selectedSheet = "Sheet1";
let mousemoved = false;
let startCellStored = false;
let startCell;
let endCell;
let defaultProperties = {
    "font-family": "Arial",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff",
    "upStream": [],
    "downStream": []
};
function loadNewSheet() {
    $("#cells").text("");
    // here cells are made
    for (let i = 1; i <= 100; i++) {
        let row = $('<div class="cell-row"></div>'); // creating div tag
        for (let j = 1; j <= 100; j++) {
            row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable ="false" ></div>`);
        }
        $("#cells").append(row);
    }
    addEventsToCells(); // jo bhi input cells ke events ek func m dalkr yha call krdiya 
    addSheetTabEventListeners(); // aise hi sheet pr jo evens hai
}
loadNewSheet();
function addEventsToCells() {
    $('.input-cell').dblclick(function () {
        $(this).attr("contenteditable", "true");
        $(this).focus();
    })
    $('.input-cell').blur(function () {
        $(this).attr("contenteditable", "false");
        // saving the text if we switch to next sheet
        //cellData[selectedSheet][rowId - 1][colId - 1].text = $(this).text();
        updateCellData("text", $(this).text());
    })
    $('.input-cell').click(function (e) {
        let call = findRowCol(this); // or findRowCol($(this))
        let rowId = call[0]; // let[rowId, colId] = findRowCol(this);
        let colId = call[1];
        let [topCell, bottomCell, leftCell, rightCell] = getTopBottomLeftRightCell(rowId, colId);
        if ($(this).hasClass("selected") && e.shiftKey) {
            unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
        } else {
            selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
        }
    });
    $(".input-cell").mousemove(function (event) {
        event.preventDefault();
        if (event.buttons == 1 && !event.shiftKey) {
            $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");
            // yeh line isliye the kyuki jb kahi aur cells select krrhe honge toh phle nhi hataenge honge unko hatane ke liye phle
            // saare selected input cell se yh classes htado
            mousemoved = true;
            if (!startCellStored) {
                let [rowId, colId] = findRowCol(event.target);
                startCell = { rowId: rowId, colId: colId };
                console.log(startCell);
                startCellStored = true;
            } else {
                let [rowId, colId] = findRowCol(event.target);
                endCell = { rowId: rowId, colId: colId };
                console.log(endCell);
                selectAllBetweenTheRange(startCell, endCell);
            }
        }
        else if (event.buttons == 0 && mousemoved) {
            startCellStored = false;
            mousemoved = false;
        }
    });
}
function getTopBottomLeftRightCell(rowId, colId) {
    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
    return [topCell, bottomCell, leftCell, rightCell];
}
function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).attr("contenteditable") == "false") {
        if ($(ele).hasClass("top-selected")) {
            topCell.removeClass("bottom-selected");
        }
        if ($(ele).hasClass("left-selected")) {
            leftCell.removeClass("right-selected");
        }
        if ($(ele).hasClass("right-selected")) {
            rightCell.removeClass("left-selected");
        }
        if ($(ele).hasClass("bottom-selected")) {
            bottomCell.removeClass("top-selected");
        }
        $(ele).removeClass("selected top-selected bottom-selected right-selected left-selected");
    }
}
function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell, mouseSelection) {
    if (e.shiftKey || mouseSelection) {

        // let rowId = parseInt(idArray[1]);
        // let colId = parseInt(idArray[3]);
        //top selected or not
        let topSelected;
        if (topCell) {
            topSelected = topCell.hasClass("selected");
        }
        //bottom selected or not
        let bottomSelected;
        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
        }
        //left selected or not

        let leftSelected;
        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
        }
        //right selected or not
        let rightSelected;
        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
        }
        // adding css colors to specific
        if (topSelected) {
            topCell.addClass("bottom-selected")
            $(ele).addClass("top-selected");
        }
        if (leftSelected) {
            leftCell.addClass("right-selected");
            $(ele).addClass("left-selected");
        }
        if (rightSelected) {
            rightCell.addClass("left-selected");
            $(ele).addClass("right-selected");
        }
        if (bottomSelected) {
            bottomCell.addClass("top-selected");
            $(ele).addClass("bottom-selected");
        }
    }
    else {
        $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");
    }
    $(ele).addClass("selected");
    changeHeader(findRowCol(ele));
}
function changeHeader([rowId, colId]) { // left
    let data;
    if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
        data = cellData[selectedSheet][rowId - 1][colId - 1];
    } else {
        data = defaultProperties;
    }
    $("#font-family").val(data["font-family"]);
    $("#font-family").css("font-family", data["font-family"]);
    $("#font-size").val(data["font-size"]);
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type = ${data.alignment}]`).addClass("selected");
    addRemoveSelectFromFontStyle(data, "bold");
    addRemoveSelectFromFontStyle(data, "italic");
    addRemoveSelectFromFontStyle(data, "underlined");
    $("#fill-color-icon").css("border-bottom", `4px solid ${data.bgcolor}`);
    $("#text-color-icon").css("border-bottom", `4px solid ${data.color}`);
}
function addRemoveSelectFromFontStyle(data, property) {
    if (data[property]) {
        $(`#${property}`).addClass("selected");
    } else {
        $(`#${property}`).removeClass("selected");
    }
}
// $(".input-cell").mousemove(function(e){
//     if(e.buttons == 1){
//         console.log(e.target, e.buttons );
//     }
// })

function selectAllBetweenTheRange(start, end) {
    for (let i = (start.rowId < end.rowId ? start.rowId : end.rowId); i <= (start.rowId < end.rowId ? end.rowId : start.rowId); i++) {
        for (let j = (start.colId < end.colId ? start.colId : end.colId); j <= (start.colId < end.colId ? end.colId : start.colId); j++) {
            //console.log($(`#row-${i}-col-${j}`));
            let [topCell, bottomCell, leftCell, rightCell] = getTopBottomLeftRightCell(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], {}, topCell, bottomCell, leftCell, rightCell, true);
            // here when function will be called e will become undefined
        }
    }
}
$(".menu-selector").change(function (e) {
    //    console.log(this.val); or console.log($(this).val());
    //console.log(isNan($(this).val())); if not number then true
    let value = $(this).val();
    let key = $(this).attr("id");
    if (key == "font-family") {
        $("#font-family").css(key, value);
    }
    if (!isNaN(value)) { // isNan = is not a number
        value = parseInt(value);
    }
    $(".input-cell.selected").css(key, value);
    // $(".input-cell.selected").each(function (index, data) {
    //     let [rowId, colId] = findRowCol(data);
    //     //cellData[selectedSheet][rowId - 1][colId - 1][key] = value;
    // });
    updateCellData(key, value);
})
$(".alignment").click(function (e) {
    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    let alignment = $(this).attr("data-type");
    $(".input-cell.selected").css("text-align", alignment);
    // $(".input-cell.selected").each(function (index, data) {
    //     let [rowId, colId] = findRowCol(data);
    //     cellData[selectedSheet][rowId - 1][colId - 1].alignment = alignment;
    // });
    updateCellData("alignment", alignment);
});
$("#bold").click(function (e) {
    setFontStyle(this, "bold", "font-weight", "bold")
});
$("#italic").click(function (e) {
    setFontStyle(this, "italic", "font-style", "italic")
});
$("#underlined").click(function (e) {
    setFontStyle(this, "underlined", "text-decoration", "underline")
});
function setFontStyle(ele, property, key, value) {
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = findRowCol(data);
        //     cellData[selectedSheet][selectedSheet][rowId - 1][colId - 1][property] = false;
        //});
        updateCellData(property, false);
    } else {
        $(ele).addClass("selected");
        $(".input-cell.selected").css(key, value);
        // $(".input-cell.selected").each(function (index, data) {
        //     // console.log(data);
        //     let [rowId, colId] = findRowCol(data);
        //     cellData[selectedSheet][rowId - 1][colId - 1][property] = true;
        // });
        updateCellData(property, true);
    }
}
function updateCellData(property, value) {
    let prevCellData = JSON.stringify(cellData);
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = findRowCol(data);
            // row or col undefined kyu hoskte hai kyuki ab hum jin row m changes for first time kkrhe hai to vo celldata
            // mein store nhi honge kyuki cell data m vhi cells store krrhe jinme changes krre ho
            if (cellData[selectedSheet][rowId - 1] == undefined) { // if row doesnt exist
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                // by (triple dots) this copy of defaultProperties is created and known as sparse array
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value; // variable in square brackets
            } else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) { // if row exists but column doesnt
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                } else { // if both exists but some changes left to be made
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
            }
        });
    } else { //taking ref of alignment -> iska mtlb left(default) nhi  hai toh surely right center hoga aur ab change krke left krna h aur vo cell pkka exist krega
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = findRowCol(data);
            if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                //agar after changes properties are exactly same to defaultproperties to hum us cell ko cellData m nhi store krenge
                //but agr eg alignment default pr krdi but shyd bg color change toh phir cellData m store krna pdega
                if (JSON.stringify(cellData[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][rowId - 1][colId - 1];
                    //ab agr us particular row m ek hi cell m change tha vo bhi default property ke equal hogya toh vo cell toh 
                    //store nhi kra delete hogya (line line above) toh ab us row to store krna ka bhi no use as saare cells
                    //ke pass defaultproperty hai toh vo row bhi delete krde from celldata 
                    if (Object.keys(cellData[selectedSheet][rowId - 1]).length == 0) {
                        delete cellData[selectedSheet][rowId - 1];
                    }
                }
            }
        });
    }
    if (saved && JSON.stringify(cellData) != prevCellData) {
        saved = false;
    }
}
$(".color-pick").colorPick({ 
    'initialColor': '#TYPECOLOR',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color != "#TYPECOLOR") {
             //console.log(this.element.attr("id"));
            if (this.element.attr("id") == "fill-color") {
                $("#fill-color-icon").css("border-bottom", `4px solid ${this.color}`);
                $(".input-cell.selected").css("background-color", this.color);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = findRowCol(data);
                //     cellData[selectedSheet][rowId - 1][colId - 1].bgcolor = this.color;
                // });
                updateCellData("bgcolor", this.color);
            } else {
                $("#text-color-icon").css("border-bottom", `4px solid ${this.color}`);
                $(".input-cell.selected").css("color", this.color);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = findRowCol(data);
                //     cellData[selectedSheet][rowId - 1][colId - 1].color = this.color;
                //     // arrow func wala this bhar wale this ko represent krta hai blki normal func wala 
                //     //this khud ke this ko represent krta h
                // });
                updateCellData("color", this.color);
            }
        }
    }
});
$("#fill-color-icon,#text-color-icon").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});

$(".container").click(function (e) { // this closes modal one with rename and delete
    $(".sheet-options-modal").remove();
});
function selectSheet(ele) { 
    $(".sheet-tab.selected").removeClass("selected");
    $(ele).addClass("selected");
    emptySheet();
    selectedSheet = $(ele).text(); // this will give innerText
    //console.log(selectedSheet);
    loadSheet();
}
function emptySheet() { // its for UI
    // cellData mein unhe cells ka data hoga jinme changes honge toh for time being
    // us coordinates  ke text ko  khali kro aur properties waps default wale 
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`)
            cell.text("");
            cell.css({
                "font-family": "Arial",
                "font-size": "14",
                "background-color": "#fff",
                "color": "#444",
                "font-weight": "",
                "font-style": "",
                "text-decoration": "",
                "text-align": "left"
            });
        }
    }
}
function loadSheet() {
    // cellData mein unhe cells ka data hoga jinme changes honge toh
    // jb vo sheet load ho toh un coorinates ke changes daldo from cellData
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`) // first cell that have changes
            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "background-color": data[rowId][colId]["bgcolor"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "text-align": data[rowId][colId].alignment
            });
        }
    }
}

$(".add-sheet").click(function (e) { 
    emptySheet();
    totalSheets++;
    lastlyAddedSheetNumber++;
    while (Object.keys(cellData).includes("Sheet" + lastlyAddedSheetNumber)) {
        lastlyAddedSheetNumber++;
    }
    cellData[`Sheet${lastlyAddedSheetNumber}`] = {};
    selectedSheet = `Sheet${lastlyAddedSheetNumber}`;
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(
        `<div class="sheet-tab selected">Sheet${lastlyAddedSheetNumber}</div>`
    );
    $(".sheet-tab.selected")[0].scrollIntoView(); // agr screen mein sheet tab m visible range m kafi 
    //sheets hai aur phir jo sheet recent bni vo dekhe isliye
    addSheetTabEventListeners(); // us sheet ke events lgado
    $("#row-1-col-1").click(); //nayi sheet bnte hi (1,1) pr click hoye
    saved = false;
});

function addSheetTabEventListeners() { //yha pr
    // contextmenu is that jo right click ke inspect wala khulta hai usse avoid krne ke checkliye
    $(".sheet-tab.selected").bind("contextmenu", function (e) {
        e.preventDefault();
        selectSheet(this);// selectSheet($(this));
        $(".sheet-options-modal").remove();
        let modal = $(`<div class="sheet-options-modal">
                            <div class="option sheet-rename">Rename</div>
                            <div class="option sheet-delete">Delete</div>
                        </div>`);
        $(".container").append(modal);
        $(".sheet-options-modal").css({ "bottom": 0.05 * $(".container").height(), "left": e.pageX });
        $(".sheet-rename").click(function (e) {
            // $ not used here coz we didnt use this modal anywhere else if we would have to use
            // place $ before html code 
            let renameModal = `<div class="sheet-modal-parent">
            <div class="sheet-rename-modal">
                <div class="sheet-modal-title">
                    <span>Rename Sheet</span>
                </div>
                <div class="sheet-modal-input-container">
                    <span class="sheet-modal-input-title">Rename Sheet to:</span>
                    <input class="sheet-modal-input " type="text">
                </div>
                <div class="sheet-modal-confirmation">
                    <div class="button ok-button">Ok</div>
                    <div class="button cancel-button">Cancel</div>
                </div>
            </div>
        </div> `;
            $(".container").append(renameModal);
            $(".cancel-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            });
            $(".ok-button").click(function (e) {
                renameSheet();
            });
            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter") {
                    renameSheet();
                }
            })
        });
        $(".sheet-delete").click(function (e) {
            let deleteModal = `<div class="sheet-modal-parent">
            <div class="sheet-delete-modal">
                <div class="sheet-modal-title"> 
                    <span>${$(".sheet-tab.selected").text()}</span>
                </div>
                <div class="sheet-modal-detail-container">
                    <span class="sheet-modal-detail-title">Are you sure?</span>
                </div>
                <div class="sheet-modal-confirmation">
                    <div class="button delete-button">
                        <div class="material-icons delete-icon">delete</div>
                        Delete
                    </div>
                    <div class="button cancel-button">Cancel</div>
                </div>
            </div>
        </div>`;
            $(".container").append(deleteModal);
            $(".cancel-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            });
            $(".delete-button").click(function (e) {
                if (totalSheets > 1) {
                    $(".sheet-modal-parent").remove();
                    let keysArray = Object.keys(cellData); //returns array of sheets at present e.g [Sheet1, Sheet2 ]
                    //console.log(keysArray);
                    let selectedSheetIndex = keysArray.indexOf(selectedSheet); //returns index of selected sheet
                    //console.log(selectedSheetIndex);
                    let currentSelectedSheet = $(".sheet-tab.selected");
                    if (selectedSheetIndex == 0) {
                        //console.log(currentSelectedSheet.next()[0]);
                        selectSheet(currentSelectedSheet.next()[0]);
                    } else {
                        selectSheet(currentSelectedSheet.prev()[0]);
                    }
                    //currentSelectedSheet.text() this stores the name of sheet
                    delete cellData[currentSelectedSheet.text()];
                    currentSelectedSheet.remove(); //removes the sheet
                    totalSheets--;
                    saved = false;
                } else {

                }
            })
        })
        if (!$(this).hasClass("selected")) {
            selectSheet(this);
        }
    });
    $(".sheet-tab.selected").click(function (e) {
        if (!$(this).hasClass("selected")) {
            selectSheet(this);
        }
    });
}
function renameSheet() { 
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
        let newCellData = {};
        for (let i of Object.keys(cellData)) {
            if (i == selectedSheet) {
                console.log("hello");
                newCellData[newSheetName] = cellData[i];
            } 
            else { // to store baake keys
                newCellData[i] = cellData[i];
            }
        }
        cellData = newCellData;
        console.log(Object.keys(cellData));
        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();
        saved = false;
    } else {
        $(".error").remove();
        $(".sheet-modal-input-container").append(
            `<div class="error"> Sheet name is not Valid or Sheet already exists!</div>`
        );
    }
}
$(".left-scroller").click(function (e) {

    let keysArray = Object.keys(cellData);
    //console.log(keysArray);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    if (selectedSheetIndex != 0) {
        selectSheet($(".sheet-tab.selected").prev()[0]);
    }
    $(".sheet-tab.selected")[0].scrollIntoView(); // this move / scroll to the selected sheet
});

$(".right-scroller").click(function (e) {
    let keysArray = Object.keys(cellData);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    if (selectedSheetIndex != (keysArray.length - 1)) {
        selectSheet($(".sheet-tab.selected").next()[0]);
    }
    $(".sheet-tab.selected")[0].scrollIntoView();
})
$("#menu-file").click(function (e) {
    let fileModal = $(`<div class="file-modal">
    <div class="file-options-modal">
        <div class="close">
            <div class="material-icons close-icon">arrow_circle_down</div>
            <div>Close</div>
        </div>
        <div class="new">
            <div class="material-icons new-icon">insert_drive_file</div>
            <div>New</div>
        </div>
        <div class="open">
            <div class="material-icons open-icon">folder_open</div>
            <div>Open</div>
        </div>
        <div class="save">
            <div class="material-icons save-icon">save</div>
            <div>Save</div>
        </div>
    </div>
    <div class="file-recent-modal">

    </div>
    <div class="file-transparent-modal"></div>
</div>`);
    $(".container").append(fileModal);
    fileModal.animate({
        "width": "100vw"
    }, 300)
    $(".close,.file-transparent-modal,.new,.save,.open").click(function (e) {
        fileModal.animate({
            "width": "0vw"
        }, 300)
        setTimeout(() => {
            fileModal.remove();
        }, 299)
    });
    $(".new").click(function (e) {
        if (saved) {
            newFile();
        } else {
            $(".container").append(`<div class="sheet-modal-parent">
            <div class="sheet-delete-modal">
                <div class="sheet-modal-title">
                    <span>${$(".title-bar").text()}</span>
                </div>
                <div class="sheet-modal-detail-container">
                    <span class="sheet-modal-detail-title">Do you want to save Changes?</span>
                </div>
                <div class="sheet-modal-confirmation">
                    <div class="button ok-button">
                        Save
                    </div>
                    <div class="button cancel-button">Cancel</div>
                </div>
            </div>
        </div>`);
            $(".ok-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                saveFile(true);
            });
            $(".cancel-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                newFile();
            })
        }
    })
    $(".save").click(function (e) {
        saveFile();
    });
    $(".open").click(function (e) {
        openFile();
    })
});
function newFile() {
    emptySheet();
    $(".sheet-tab").remove();
    $(".sheet-tab-container").append(`<div class="sheet-tab selected"> Sheet1</div>`);
    cellData = { "Sheet1": {} };
    selectedSheet = "Sheet1";
    totalSheets = 1;
    lastlyAddedSheetNumber = 1;
    addSheetTabEventListeners();
    $("#row-1-col-1").click();
}
function saveFile(createNewFile) {
    if (!saved) {
        $(".container").append(`<div class="sheet-modal-parent">
    <div class="sheet-rename-modal">
        <div class="sheet-modal-title">
            <span>Save File</span>
        </div>
        <div class="sheet-modal-input-container">
            <span class="sheet-modal-input-title">File Name:</span>
            <input class="sheet-modal-input"  value = "${$(".title-bar").text()}" type="text">
        </div>
        <div class="sheet-modal-confirmation">
            <div class="button ok-button">Save</div>
            <div class="button cancel-button">Cancel</div>
        </div>
    </div>
</div>`);
        $(".ok-button").click(function (e) {
            let fileName = $(".sheet-modal-input").val();
            if (fileName) {
                let href = `data:application/json,${encodeURIComponent(JSON.stringify(cellData))}`;
                let a = $(`<a href = ${href} download = "${fileName}.json"></a>`);
                $(".container").append(a);
                a[0].click(); // using javascript jquery wasnt working
                a.remove();
                $(".sheet-modal-parent").remove();
                saved = true;
                if (createNewFile) {
                    newFile();
                }
            }
        });
        $(".cancel-button").click(function (e) {
            $(".sheet-modal-parent").remove();
            if (createNewFile) {
                newFile();
            }
        })
    }
}
function openFile(){
    let inputFile = $(`<input accept = "application/json" type= "file" />`);
    $(".container").append(inputFile);
    //console.log(inputFile.val());
    inputFile.click();
    inputFile.change(function (e) {
        //console.log(e.target.value);
        let file = e.target.files[0];
        //console.log(e.target.files[0]);
        $(".title-bar").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            //console.log(reader.result);
            emptySheet();
            $(".sheet-tab").remove();
            //console.log(JSON.parse(reader.result));
            cellData = JSON.parse(reader.result);
            let sheets = Object.keys(cellData);
            for (let i of sheets) {
                $(".sheet-tab-container").append(`<div class="sheet-tab selected">${i}</div>`);
            }
            addSheetTabEventListeners();
            $(".sheet-tab").removeClass("selected");
            $($(".sheet-tab")[0]).addClass("selected");
            selectedSheet = sheets[0];
            totalSheets = sheets.length;
            //console.log(sheets.length);
            lastlyAddedSheetNumber = totalSheets;
             loadSheet();
            inputFile.remove();
        }
    })
}
let clipBoard = { startCell: [], cellData: {} };
let contentCutted = false;
$("#cut,#copy").click(function (e) {
    if ($(this).text() == "content_cut") {
        contentCutted = true;
    }
    //console.log($(".input-cell.selected")[0])
    //console.log(findRowCol($(".input-cell.selected")[0]))
    clipBoard.startCell = findRowCol($(".input-cell.selected")[0]);
    $(".input-cell.selected").each((index, data) => {
        let [rowId, colId] = findRowCol(data);
        //if row && col exists
        if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]){
            // vo row exist nhi krege toh  phle usse bna rhe h
            if (!clipBoard.cellData[rowId]) {
                clipBoard.cellData[rowId] = {};
            }
            clipBoard.cellData[rowId][colId] = { ...cellData[selectedSheet][rowId - 1][colId - 1] };
        }
    })
    // console.log(cellData);
    // console.log(clipBoard);
});

$("#paste").click(function (e) { //yha pr
    if (contentCutted) {
        emptySheet();
    }
    let startCell = findRowCol($(".input-cell.selected")[0]);
    //console.log(Object.keys(clipBoard.cellData));
    let rows = Object.keys(clipBoard.cellData);
    for (let i of rows) {
        let cols = Object.keys(clipBoard.cellData[i]);
        //console.log(cols);
        for (let j of cols) {
            if (contentCutted) {
                delete cellData[selectedSheet][i - 1][j - 1];
                if (Object.keys(cellData[selectedSheet][i - 1]).length == 0) {
                    delete cellData[selectedSheet][i - 1];
                }
            }
            let rowDistance = parseInt(i) - parseInt(clipBoard.startCell[0]);
            let colDistance = parseInt(j) - parseInt(clipBoard.startCell[1]);
            //if row doesnt exist toh row bnayi
            if (!cellData[selectedSheet][startCell[0] + rowDistance - 1]) {
                cellData[selectedSheet][startCell[0] + rowDistance - 1] = {};
            }
            cellData[selectedSheet][startCell[0] + rowDistance - 1][startCell[1] + colDistance - 1] = { ...clipBoard.cellData[i][j] };
        }
    }
    loadSheet();
    if (contentCutted) {
        contentCutted = false;
        clipBoard = { startCell: [], cellData: {} };
    }
})
// $("#function-input").blur(function (e) {
//     if ($(".input-cell.selected").length > 0) {
//         let formula = $(this).text();
//         //console.log(formula);
//         $(".input-cell.selected").each(function (index, data) {
//             let tempElements = formula.split(" ");
//             //console.log(tempElements);
//             let elements = [];
//             for (let i of tempElements) {
//                 if (i.length > 1) {
//                     i = i.replace("(", "");
//                     i = i.replace(")", "");
//                     elements.push(i);
//                 }
//             }
//             // console.log(elements);
//             if (updateStreams(data, elements)) {
//                 console.log(cellData);
//             } else {
//                 alert("Formula is invalid!")
//             }
//         });
//     } else {
//         alert("Please select a cell first to apply formula!")
//     }
// });
// function updateStreams(ele, elements) {
//     let [rowId, colId] = findRowCol(ele);
//     for(let i = 0; i < elements.length; i++) {
//         if(checkForSelf(rowId,colId,elements[i])){
//             return false;
//         }
//     }
   
//     if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1] && cellData[selectedSheet][rowId - 1][colId - 1].upStream.length > 0) {

//         let upStream = cellData[selectedSheet][rowId - 1][colId - 1].upStream;
//         console.log(upStream);
//         let selfCode = calcColName(colId) + rowId;
//         for (let i of upStream) {
//             let [calRowId, calColId] = calcSelfValue(i);
//             let index = cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.indexOf(selfCode);
//             cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.splice(index, 1);
//             if (JSON.stringify(cellData[selectedSheet][calRowId - 1][calColId - 1]) == JSON.stringify(defaultProperties)) {
//                 delete cellData[selectedSheet][calRowId - 1][calColId - 1];
//                 if (Object.keys(cellData[selectedSheet][calRowId - 1]).length == 0) {
//                     delete cellData[selectedSheet][calRowId - 1];
//                 }
//             }
//         }
//     }
//     // agr row exist nhi krti 
//     if (!cellData[selectedSheet][rowId - 1]) {
//         cellData[selectedSheet][rowId - 1] = {};
//         cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
//     } 
//     // agr row exist krti hai but col exist nhi krta
//      else if (!cellData[selectedSheet][rowId - 1][colId - 1]) {
//         cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
//     }
//     cellData[selectedSheet][rowId - 1][colId - 1].upStream = []; //nayi upstream ko add krne se phle upstream empty kro
//     let data = cellData[selectedSheet][rowId - 1][colId - 1];
//     for (let i = 0; i < elements.length; i++) {
//         if (data.downStream.includes(elements[i])) {
//             return false;
//         } else {
//             if (!data.upStream.includes(elements[i])) {
//                 data.upStream.push(elements[i]);
//             }
//         }
//     }
//     return true;
// }
// function calcSelfValue(ele) {
//     let calRowId;
//     let calColId;
//     for (let i = 0; i < ele.length; i++) {
//         if (!isNaN(ele.charAt(i))) {
//             let leftString = ele.substring(0, i);
//             let rightString = ele.substring(i);
//             calColId = calcColId(leftString);
//             calRowId = parseInt(rightString);
//             break;
//         }
//     }
//     return [calRowId, calColId];
// }
// function checkForSelf(rowId, colId, ele) {
//     let [calRowId, calColId] = calcSelfValue(ele);
//     // check ke khud ke hi cell ko function-input m daalrhe h
//     if (calRowId == rowId && calColId == colId) {
//         return true;
//     } else {
//         //here adding in downstream
//         let selfName = calcColName(colId) + rowId;
//         //agr row exist nhi krti
//         if (!cellData[selectedSheet][calRowId - 1]) {
//             cellData[selectedSheet][calRowId - 1] = {};
//             cellData[selectedSheet][calRowId - 1][calColId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
//         }//agr col exist nhi krti 
//         else if (!cellData[selectedSheet][calRowId - 1][calColId - 1]) {
//             cellData[selectedSheet][calRowId - 1][calColId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
//         }
//         console.log(!cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.includes(selfName), ele);
//         if (!cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.includes(selfName)) {
//             cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.push(selfName);
//         }
//         return false;
//     }
// }

// function calcColId(str){
//     let place = str.length - 1;
//     let total = 0;
//     for(let i = 0; i < str.length; i++){
//         let charValue = str.charCodeAt(i) - 64;
//         total += Math.pow(26,place) * charValue;
//         place--;
//     }
//     return total;
// }