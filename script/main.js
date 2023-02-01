const MainWindow      = document.getElementById("MainWindow");
const TagCheckWindow  = document.getElementById("CheckTag");
const TagAddingWindow = document.getElementById("AddTag");
const SentenceWindow  = document.getElementById("SentenceWindow");
const TagCheckContents=[document.getElementById("CheckTitle"),document.getElementById("CheckTag1"),document.getElementById("CheckTag2"),document.getElementById("CheckComment"),document.getElementById("CheckTag3")];
const AddContents     =[document.getElementById("AddTitle"),document.getElementById("AddTag1"),document.getElementById("AddTag2"),document.getElementById("AddComment"),document.getElementById("AddTag3")];
let TagIndex        = [0,0];
const AddButton       = document.getElementById("AddButton");
const AddDoneButton   = document.getElementById("AddDoneButton");
const DeleteButton    = document.getElementById("DeleteButton");
const FilenameBox     = document.getElementById("FilenameBox");
const EditorNameBox   = document.getElementById("EditorNameBox");
let TagNames1st = [];
let TagNames2nd //= ["1st","2nd","address","null"];
let ColorList =[];
let Adding          = false;
let AddingElement   = null;
let SelectedSentence = null;
let filename, editorName;
let selectedTagID ="";
let cssTemp = ".AnnotationLevel1\{\n padding: 0 0 0px;\n\}\n.AnnotationLevel2\{\n padding: 0 0 5px;\n\}\n.AnnotationLevel3\{\n padding: 0 0 10px;\n\}\npre \{\nfont: normal normal normal 25px/30px Arial;\n\}";
let AggregatedText = "";
let newlineCode = "";
//console.log(TagText);

function hsvToRgb(h, s, v) {
    let r, g, b;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return (
        "#" +
        ((1 << 24) + ((r * 255) << 16) + ((g * 255) << 8) + Math.round(b * 255))
            .toString(16)
            .slice(1)
    );
}


MainWindow.addEventListener(
    "drop",
    async (e) => {
        e.stopPropagation();
        e.preventDefault();
        MainWindow.style.backgroundColor = "#ffffff";
        //e.preventDefault();
        const files = e.dataTransfer.files;
        let tabTextContent = "",
            isXML = false;
        if (files.length === 0) {
            return;
        }
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.readAsText(files[i]);
            const dt = new DataTransfer();
            dt.items.add(files[i]);
            const extend = files[i].name.split(".").reverse()[0];
            await new Promise((resolve) => (reader.onload = () => resolve()));
            if (extend === "txt") {
                //console.log(reader.result)
                if (reader.result.indexOf("Subcorp") === 0) {
                    //先頭がSubcorpの場合、タブ区切りのデータと判断
                    tabTextContent = reader.result;
                    filename = tabTextContent.split("\n")[1].split("\t")[1];
                    FilenameBox.value = filename;
                    console.log(filename);
                } else {
                    mainSetence = reader.result;
                    newlineCode = 0;
                    if(mainSetence.includes("\n"))newlineCode++;
                    if(mainSetence.includes("\r"))newlineCode++;
                    console.log(newlineCode);
                    //OriginalText.files = dt.files;
                    //OriginalText.dispatchEvent(changeEvent);
                }
            } else if (extend === "xml") {
                isXML = true;
                XMLdata = reader.result;
            }
        }
        ParserTabText(tabTextContent);
        if (isXML){
            SentenceXMLReverser();
        }
        Redraw();
    },
    false
);

function Redraw(changed = true){
    TagAddingWindow.style.display = "none";
    TagCheckWindow.style.display = "none";
    if (changed) {
        SentenceXMLGenerator(mainSetence, TagObjList);
        SentenceHTMLGenerator(mainSetence, TagObjList);
    }
    $("#SentenceWindow").empty();
    $("#SentenceWindow").html(HTMLdata);
    ColorList =[];
    cssTemp = ".AnnotationLevel1\{\n padding: 0 0 0px;\n\}\n.AnnotationLevel2\{\n padding: 0 0 5px;\n\}\n.AnnotationLevel3\{\n padding: 0 0 10px;\n\}\npre \{\nfont: normal normal normal 25px/30px Arial;\n\}\n";
    TagCheckContents[1].textContent=TagNames1st[0];
    AddContents[1].textContent=TagNames1st[0];
    TagCheckContents[4].textContent=TagNames1st[0]+": value";
    AddContents[4].textContent=TagNames1st[0]+": value";
    while(AddContents[2].firstChild)AddContents[2].removeChild(AddContents[2].firstChild);
    while(TagCheckContents[2].firstChild)TagCheckContents[2].removeChild(TagCheckContents[2].firstChild);
    for(let i = 0;i<TagNames2nd.length;i++){
        ColorList.push([hsvToRgb(1.0/TagNames2nd.length*i,1.0,0.7),hsvToRgb(1.0/TagNames2nd.length*i,1.0,1.0)+"50"]);
        let option = document.createElement("option");
        option.value = TagNames2nd[i];
        option.text = TagNames2nd[i];
        AddContents[2].appendChild(option);
        option = document.createElement("option");
        option.value = TagNames2nd[i];
        option.text = TagNames2nd[i];
        TagCheckContents[2].appendChild(option);
        cssTemp += ".Annotation"+i.toString()+"\ {color: "+ColorList[i][0]+"; background: linear-gradient(transparent 93%, "+ColorList[i][0]+" 0%); display: inline; \}\n";
    }
    let elements = document.getElementsByTagName("span");
    for (let element of elements) {
        for(let i = 0;i<TagNames2nd.length;i++){
            if(element.classList[0]=="Annotation"+i.toString()){
                element.style.color = ColorList[i][0];
                element.style.background = "linear-gradient(transparent 93%, "+ColorList[i][0]+" 0%)"
                element.style.display = "inline";
            }
        }
        element.addEventListener("click", (e) => {
            if(Adding)return;
            e.stopPropagation();
            e.preventDefault();
            let pre = element.parentNode;
            if (SelectedSentence != null) {
                //console.log(SelectedSentence);
                SelectedSentence[0].className = "NoSelected";
                if(SelectedSentence[1]!=null){
                    SelectedSentence[1].classList.remove("TagSelected");
                    SelectedSentence[1].style.backgroundColor = null;
                    // for (let i = 0; i < TagNames2nd.length; i++)
                    //     SelectedSentence[1].classList.remove(
                    //         "TagBack" + i.toString()
                    //     );
                    SelectedSentence[1].classList.add("TagNoSelected");
                }
            }
            while (pre.tagName !== "PRE") {
                pre = pre.parentNode;
            }
            SelectedSentence = [pre, element];
            pre.className = "Selected";

            TagCheckWindow.style.display = "block";
            element.classList.remove("TagNoSelected");
            element.classList.add("TagSelected");
            for(let i = 0; i<TagNames2nd.length;i++){
                if(element.classList[0]=="Annotation"+i.toString()) element.style.backgroundColor=ColorList[i][1];
                //console.log(ColorList[i][0]);
                //if(element.classList[0]=="Annotation"+i.toString()) element.classList.add("TagBack"+i.toString());
            }
            const tags = SearchTagID(element.id);
            //console.log(tags);
            TagCheckContents[0].className = "AnnotationInfoHead TagSelected "+element.classList[0];
            TagCheckContents[0].textContent=tags[0];
            TagCheckContents[1].textContent=tags[1];
            TagCheckContents[2].value=tags[2];
            TagCheckContents[3].value=tags[3];
            selectedTagID = element.id;
            //console.log(SelectedSentence);
        });
    }
    elements = SentenceWindow.getElementsByTagName("pre");
    for(let element of elements){
        element.addEventListener("click",(e)=>{
            if(Adding)return;
            e.stopPropagation();
            e.preventDefault();
            if (SelectedSentence != null) {
                SelectedSentence[0].className = "NoSelected";
                if(SelectedSentence[1]!=null){
                    TagCheckWindow.style.display = "none";
                    // for (let i = 0; i < TagNames2nd.length; i++)
                    //     SelectedSentence[1].classList.remove(
                    //         "TagBack" + i.toString()
                    //     );
                    SelectedSentence[1].style.backgroundColor = null;
                    SelectedSentence[1].classList.remove("TagSelected");
                    SelectedSentence[1].classList.add("TagNoSelected");
                }
            }
            element.className="Selected";
            SelectedSentence = [element,null];

        });
    }
    // elements = SentenceWindow.getElementsByTagName("text");
    // for(const element of elements){
    //     element.innerHTML = element.textContent.normalize("NFC");
    // }
}

MainWindow.addEventListener("dragover", function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.backgroundColor = "#e1e7f0";
}, false);
  
MainWindow.addEventListener("dragleave", function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.backgroundColor = "#ffffff";
}, false);

TagCheckWindow.style.display = "none";
TagCheckWindow.firstElementChild.addEventListener("click", ()=>{
    TagCheckWindow.style.display = "none";
    if(Adding){
        AddButton.style.display = "block";
        Adding = false;
        DeleteButton.textContent = "Delete Annotation";
        //return;
    }
    if (SelectedSentence != null) {
        console.log(SelectedSentence);
        SelectedSentence[0].className = "NoSelected";
        SelectedSentence[1].classList.remove("TagSelected");
        SelectedSentence[1].style.backgroundColor = null;
        //for (let i = 0; i < TagNames2nd.length; i++)
        // SelectedSentence[1].classList.remove(
        //     "TagBack" + i.toString()
        // );
        SelectedSentence[1].classList.add("TagNoSelected");
    }
    SelectedSentence=null;
});

TagAddingWindow.style.display = "none";
TagAddingWindow.firstElementChild.addEventListener("click", ()=>{
    TagAddingWindow.style.display = "none";
    AddButton.style.display="block";
    Redraw(false)
    AddingElement = null
    Adding = false;
});

AddButton.addEventListener("mousedown", (e) => {
    const selection = window.getSelection();
    e.preventDefault();
    if (selection.anchorNode === null) {
        alert("Please specify the range to annotate.");
        return;
    }
    if (
        !(
            selection.anchorNode.parentNode.className == "Selected" ||
            selection.anchorNode.parentNode.className == "NoSelected" ||
            selection.anchorNode.parentNode.tagName == "SPAN"
        )||
        selection.isCollapsed
    ) {
        alert("Please specify the range to annotate.");
        return;
    }
    if (
        !(
            selection.focusNode.parentNode.className == "Selected" ||
            selection.focusNode.parentNode.className == "NoSelected" ||
            selection.focusNode.parentNode.tagName == "SPAN"
        )||
        selection.isCollapsed
    ) {
        alert("Please specify the range to annotate.");
        return;
    }
    let anchorPRE = selection.anchorNode.parentNode;
    let focusPRE = selection.focusNode.parentNode;
    //console.log(anchorPRE,anchorPRE.parentNode);
    //console.log(focusPRE,focusPRE.parentNode);
    while(anchorPRE.tagName !== "PRE")anchorPRE = anchorPRE.parentNode;
    while(focusPRE.tagName !== "PRE")focusPRE = focusPRE.parentNode;
    if(anchorPRE!=focusPRE){
        alert("You cannot annotate across multiple lines.");
        return;
    }
    //console.log(selection.anchorNode);

    let pre = selection.anchorNode,anchor=selection.anchorOffset,focus=selection.focusOffset;

    while(pre.previousSibling!=null){
        pre = pre.previousSibling;
        //console.log(pre);
        anchor+=pre.textContent.length;
    }
    pre = selection.anchorNode.parentNode;
    //console.log(selection.anchorNode.parentNode.tagName);
    if (pre.tagName == "SPAN") {
        while (pre.tagName !== "PRE") {
            while (pre.previousSibling != null) {
                pre = pre.previousSibling;
                //if (pre.tagName !== "PRE") continue;
                //console.log(pre);
                anchor+=pre.textContent.length;
                //console.log(pre.textContent);
            }
            pre = pre.parentNode;
            //console.log("hoge", pre);
        }
    }
    while (pre.previousSibling != null) {
        pre = pre.previousSibling;
        if (pre.tagName !== "PRE") continue;
        //console.log(pre);
        //console.log(pre.textContent);
        anchor += pre.textContent.length+newlineCode;
    }
    pre = selection.focusNode;
    while(pre.previousSibling!=null){
        pre = pre.previousSibling;
        //console.log(pre);
        focus+=pre.textContent.length;
    }
    pre = selection.focusNode.parentNode;
    //console.log(selection.focusNode.parentNode.tagName);
    if (pre.tagName == "SPAN") {
        while (pre.tagName !== "PRE") {
            while (pre.previousSibling != null) {
                pre = pre.previousSibling;
                //if (pre.tagName !== "PRE") continue;
                //console.log(pre);
                focus+=pre.textContent.length;
                //console.log(pre.textContent);
            }
            pre = pre.parentNode;
            //console.log("hoge", pre);
        }
    }
    while (pre.previousSibling != null) {
        pre = pre.previousSibling;
        if (pre.tagName !== "PRE") continue;
        //console.log(pre);
        //console.log(pre.textContent);
        focus += pre.textContent.length+newlineCode;
    }
    if(anchor == focus)TagIndex = [anchor,anchor+selection.toString().length];
    else if(anchor<focus)TagIndex=[anchor,focus];
    else            TagIndex=[focus,anchor];
    //console.log(startIndex);
    //TagIndex = [startIndex,startIndex+selection.toString().length];
    console.log(TagIndex);
    if(!AddTagCheck(TagIndex[0],TagIndex[1])){
        alert("The new annotation cannot start/end in the middle of the existing annotation.");
        return;
    }
    AddContents[0].textContent=selection.toString();
    TagAddingWindow.style.display = "block";
    AddContents[3].value = "";
    AddButton.style.display = "none";
    TagCheckWindow.style.display = "none";
    AddingElement = document.createElement("SPAN");
    const range = selection.getRangeAt(0);
    if(range.startContainer.parentNode!=range.endContainer.parentNode){
        let startDepth = 0,endDepth = 0;
        for(let i = 1;i<4;i++){
            if(range.startContainer.parentNode.className.indexOf("AnnotationLevel"+i.toString())!=-1){
                startDepth = i;
            }
            if(range.endContainer.parentNode.className.indexOf("AnnotationLevel"+i.toString())!=-1){
                endDepth = i;
            }
        }
        console.log(startDepth,endDepth);
        if(startDepth>endDepth){
            for(let i = 0;i<startDepth-endDepth;i++){
                console.log(range.startContainer.parentNode.tagName);
                if(range.startContainer.parentNode.tagName=="PRE"){
                    range.setStartAfter(range.startContainer.previousSibling);
                    break;
                };
                range.setStartBefore(range.startContainer.parentNode);
            }
        }
        else{
            for(let i = 0;i<endDepth-startDepth;i++){
                console.log(range.startOffset,range.endOffset);
                console.log(range.startContainer,range.endContainer);
                console.log(range.startContainer.parentNode,range.endContainer.parentNode);
                console.log(range.startContainer.parentNode.tagName,range.endContainer.parentNode.tagName);
                range.setEndAfter(range.endContainer);
                if(range.endContainer.parentNode.tagName=="PRE"){
                    range.setEndBefore(range.endContainer.nextSibling);
                    break;
                };
            }
        }
    }
    range.surroundContents(AddingElement);
    selection.removeAllRanges();
    ChangePreview(AddContents[2].value);
    Adding = true;
});

AddDoneButton.addEventListener("click",(e)=>{
    e.stopPropagation();
    e.preventDefault();
    if(!Adding)return;
    Adding = false;
    TagAddingWindow.style.display = "none";
    AddButton.style.display = "block";
    AddTag(
      filename,
      Math.max(...TagObjList.map((pre) => pre.ID)) + 1,
      TagIndex[0],
      TagIndex[1],
      AddContents[3].value,
      TagNames1st[0],
      AddContents[2].value
    );
    Redraw();
});

DeleteButton.addEventListener("click",function (e){
    e.stopPropagation();
    e.preventDefault();
    AddButton.style.display = "block";
    TagCheckWindow.style.display = "none";
    releaseTagObjTree();
    //console.log(selectedTagID);
    let start,end;
    if(Adding){
        Adding = false;
        DeleteButton.textContent = "Delete Annotation";
        for(let tag of TagObjList){
            if(tag.ID == selectedTagID){
                start = tag.Start;
                end = tag.End;
                //makeTagObjTree();
                break;
            }
        }
        RemoveTagID(selectedTagID);
        AddTag(
            filename,
            selectedTagID,
            start,
            end,
            TagCheckContents[3].value,
            TagNames1st[0],
            TagCheckContents[2].value
        );
    }
    else RemoveTagID(selectedTagID);
    Redraw();
})

AddContents[2].addEventListener("change",()=>{
    ChangePreview(AddContents[2].value);
});

TagCheckContents[2].addEventListener("change",(e)=>{
    //e.preventDefault();
    //e.stopPropagation();
    DeleteButton.textContent = "Change Annotation";
    Adding = true;
    AddButton.style.display = "none";
    AddingElement = SelectedSentence[1];
    ChangePreview(TagCheckContents[2].value);
})

TagCheckContents[3].addEventListener("change",(e)=>{
    DeleteButton.textContent = "Change Annotation";
    Adding = true;
    AddButton.style.display = "none";
})

function ChangePreview(value){
    for(let i = 0;i<TagNames2nd.length;i++){
        if(value == TagNames2nd[i]){
            AddContents[0].className = "TagSelected Annotation"+i.toString();
            //AddingElement.className = "TagSelected TagBack"+i.toString();
            AddingElement.style.backgroundColor = ColorList[i][1];
        }
    }
}

FilenameBox.addEventListener("change",(e)=>{
    filename=FilenameBox.value;
    console.log(filename);
});

EditorNameBox.addEventListener("change",(e)=>{
    editorName=EditorNameBox.value;
});

function TSVDownload(){
    AggregatedText = "";
    const container = document.querySelector("#SentenceWindow");
    const ps = container.querySelectorAll("pre");
    let tabCount = ps[0].textContent.split("\t").length-1;
    releaseTagObjTree();
    for(const pre of ps){
        AggregatedText += pre.textContent;
        if(pre.textContent.split("\t").length-1 < tabCount){
            for(let i = 0;i<tabCount-pre.textContent.split("\t").length+1;i++) AggregatedText +="\t";
        }
        for(const i in TagNames2nd){
            const spans = pre.querySelectorAll("span.Annotation"+i.toString());
            AggregatedText+="\t"+spans.length.toString()+"\t";
            let spanTexts = Array();
            for(const s of spans){
                let tag, str="";
                for(tag of TagObjList){
                    if(tag.ID == s.id) break;
                }
                str+=s.textContent.replaceAll("\t","")
                if(tag.CommentRole) str +="【"+ tag.CommentRole + "】";
                spanTexts.push(str);
            }
            AggregatedText+=spanTexts.join(";");
        }
        AggregatedText+="\n"
    }
    makeTagObjTree();
    let tmp = "File Name\t"+filename+"\nFeature\t"+TagNames1st[0]+"\nEditor's Name\t"+editorName+"\n"+"Text";
    for(let i = 0;i<tabCount;i++)tmp += "\t";
    for(const tag of TagNames2nd){
        tmp += "\t"+tag.replace("\r","")+"\t";
    }
    AggregatedText = tmp + "\n" + AggregatedText;
    console.log(AggregatedText);

    var blob = new Blob([AggregatedText], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = FilenameBox.value.replace(/\.[^.]+$/, "") + "-summary.txt";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById("AnDataDL").addEventListener("click",()=>TEXTDownload());
document.getElementById("AgDataDL").addEventListener("click",()=>TSVDownload());
document.getElementById("ApDataDL").addEventListener("click",()=>HTMLDownload());
