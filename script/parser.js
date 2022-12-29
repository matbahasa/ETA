
let mainSetence; //文章
let TagObjList = []; //タグ情報を格納した配列
let XMLdata; //XML形式でタグ情報を付与した文字列
let HTMLdata;//すべてハイライトされたHTML
let HTMLFileString;//ダウンロードする形式のHTMLファイルデータ
let TEXTFileString;//ダウンロードする形式のテキストファイルデータ
let Filename = "data_myn.txt";
let Language = "english";

function includeCheck(target, ref){
    return ref.Start <= target.Start && target.End <= ref.End;
}

function insertChildren(tagTree,tag){
    if(includeCheck(tag,tagTree)){
        if(tagTree.child){
            if(tagTree.child = insertChildren(tag,tagTree.child))return JSON.parse(JSON.stringify(tagTree));
            else{
                //Broken
                console.log("broken")
                return null;
            }
        }
        else{
            //console.log(tagTree,"<=",JSON.parse(JSON.stringify(tag)))
            tagTree.child = JSON.parse(JSON.stringify(tag));
            return JSON.parse(JSON.stringify(tagTree));
        }
    }
    else if(includeCheck(tagTree,tag)){
        //console.log(tagTree,"=>",JSON.parse(JSON.stringify(tag)));
        tag.child = JSON.parse(JSON.stringify(tagTree));
        tagTree = JSON.parse(JSON.stringify(tag));
        return JSON.parse(JSON.stringify(tagTree));
    }
    return null;
}

function makeTagObjTree(){
    if(TagObjList.length == 0)return;
    TagObjList.sort((a,b) => a.Start - b.Start)// sort
    let newTree=[],newIndex = 1;
    newTree.push(JSON.parse(JSON.stringify(TagObjList[0])));
    for(let i = 1; i < TagObjList.length;i++){
        const tag = JSON.parse(JSON.stringify(TagObjList[i]));
        let childCheck = false;
        for(const index in newTree){
            let tmp;
            if(tmp = insertChildren(JSON.parse(JSON.stringify(newTree[index])),JSON.parse(JSON.stringify(tag)))){
                newTree[index] = tmp;
                childCheck=true;
                break;
            }
        }
        if(!childCheck){
            newTree[newIndex++]=tag; 
        }
    }
    TagObjList = JSON.parse(JSON.stringify(newTree));
    return;
    //make Tag tree
    // for(var i = 0; i < TagObjList.length - 1;i++){
    //     if(includeCheck(TagObjList[i], TagObjList[i+1])){
    //         var tmp = JSON.parse(JSON.stringify(TagObjList[i]));
    //         TagObjList.splice(i, 1);

    //         if(!TagObjList[i].child){
    //             TagObjList[i].child = tmp;
    //         }
    //         else{
                
    //             if(includeCheck(TagObjList[i].child, tmp)){
    //                 var tmpChild = JSON.parse(JSON.stringify(TagObjList[i].child));
    //                 TagObjList[i].child = tmp;
    //                 TagObjList[i].child.child = tmpChild;
    //                 TagObjList[i].child.child.child = null;
    //             }
    //             if(includeCheck(tmp, TagObjList[i].child)){
    //                 TagObjList[i].child.child = tmp;
    //             }
    //         }
    //         i--;
    //     }

    //     else if(includeCheck(TagObjList[i+1], TagObjList[i])){
    //         var tmp = JSON.parse(JSON.stringify(TagObjList[i+1]));
    //         TagObjList.splice(i+1, 1);
    //         if(TagObjList[i].child == null){
    //             TagObjList[i].child = tmp;
    //         }
    //         else{
                
    //             if(includeCheck(TagObjList[i].child, tmp)){
    //                 var tmpChild = JSON.parse(JSON.stringify(TagObjList[i].child));
    //                 TagObjList[i].child = tmp;
    //                 TagObjList[i].child.child = tmpChild;
    //                 TagObjList[i].child.child.child = null;
    //             }
    //             if(includeCheck(tmp, TagObjList[i].child)){
    //                 TagObjList[i].child.child = tmp;
    //             }
    //         }
    //         i--;
    //     }
    //
    //}
}
function releaseTagObjTree(){
    //make Tag tree
    for(tag of TagObjList){
        if(tag.child != null){
            if(tag.child.child != null){
                console.log(tag.child.child);
                let tmp = JSON.parse(JSON.stringify(tag.child.child));
                TagObjList.push(tmp);
                tag.child.child = null;
            }
            let tmp = JSON.parse(JSON.stringify(tag.child));
            TagObjList.push(tmp);
            tag.child = null;
        }
    }
    console.log(TagObjList);
}

function RemoveTagID(id){
    console.log("Remove Tag Id =",id);
    //releaseTagObjTree();
    TagObjList = TagObjList.filter(tag=> tag.ID != id);
    makeTagObjTree();
}

function SearchTagID(id){
    releaseTagObjTree();
    for(tag of TagObjList){
        if(tag.ID == id){
            var prosubKind = tag.tag2nd;
            makeTagObjTree();
            return [tag.Text,  tag.tag1st, prosubKind, tag.CommentRole];
        }
    }

    //error
    window.alert("[ERROR] Internal error in RemoveTag")

}

function AddTagCheck(start, end){
    releaseTagObjTree();
    for(tag of TagObjList){
        var StartInc = start <= tag.Start && tag.Start < end;
        var EndInc = start < tag.End && tag.End <= end;//start 179, end 180, Start 179, End 185
        var SameStart = start == tag.Start;
        var SameEnd = end == tag.End;
        if(StartInc != EndInc && !SameStart && !SameEnd){
            console.log(tag.Start, tag.End, start, end, StartInc, EndInc);
            makeTagObjTree();
            return false;
        }
    }
    makeTagObjTree();
    return true;
}

function AddTag(Filename, ID, Start, End, Comment, _tag1st,_tag2nd){
    let tagText = mainSetence.substr(Start, End-Start);
    //error
    if(Start == End)                            window.alert("[ERROR] Internal error in AddTag");
    if(!AddTagCheck(Start, End))                window.alert("[ERROR] Internal error in AddTag : Tag position error");
    if(!TagNames2nd.includes(_tag2nd))       window.alert("[ERROR] Internal error in AddTag : Invalid feature value");
    console.log("Add Tag,",ID, Start, End, Comment, _tag1st, _tag2nd, tagText);

    releaseTagObjTree();

    if(typeof(ID    ) == 'string')ID = Number(ID);
    if(typeof(Start ) == 'string')ID = Number(ID);
    if(typeof(End   ) == 'string')ID = Number(ID);

    let tag =
    {
        Subcorp         : "Texts",
        Filename        : Filename,
        ID              : ID,
        Start           : Start,
        End             : End,
        Text            : tagText,
        CommentRole     : Comment,
        ParentID        : null,
        doc_completeness: null,
        tag1st          : _tag1st,
        tag2nd           : _tag2nd,
        child           : null
    }
    TagObjList.push(tag);
    console.log(JSON.parse(JSON.stringify(TagObjList)))
    makeTagObjTree();
}

function ParserTabText(text){//入力テキストからTagObjListを作成
    TagObjList = [];
    var sentences = text.split('\n');

    for( sentence of sentences){

        //make Tag Object
        sentenceRows = sentence.split('\t');
        if(sentenceRows[0] && sentenceRows[0] != "Subcorp"){

            tagKind = 'null'
            for(var i = 11;i < sentenceRows.length; i++){
                if(Number(sentenceRows[i]) == 1){
                    tagKind = TagNames2nd[i-11]
                }
            }

            var tag =
            {
                Subcorp         : sentenceRows[0],
                Filename        : sentenceRows[1],
                ID              : Number(sentenceRows[2]),
                Start           : Number(sentenceRows[3]),
                End             : Number(sentenceRows[4]),
                Text            : sentenceRows[5],
                CommentRole     : sentenceRows[6],
                ParentID        : Number(sentenceRows[7]),
                doc_completeness: sentenceRows[8],
                tag1st          : TagNames1st[0],
                tag2nd          : tagKind,
                child           : null
            }
            TagObjList.push(tag);
        }
        else if(sentenceRows[0] && sentenceRows[0] == "Subcorp"){
            TagNames1st[0] = sentenceRows[10];
            TagNames2nd = sentenceRows.slice(11);
            TagNames2nd.push("null");
        }
    }

    makeTagObjTree();
}

function SentenceXMLGenerator(sentence, tag){
    if(sentence==null)return;


    //XML 生成
    let parser = new DOMParser();
    var initxml = 
        "<?xml version='1.0' encoding='utf-8'?>\n\
            \t<document>\n\
            \t<header>\n\
                \t\t<textfile>Texts/" + FilenameBox.value +"</textfile>\n\
                \t\t<lang> " + Language + "</lang>\n\
            \t</header>\n\
            \t<body></body>\n\
        </document>"

    
    let XMLDOM = parser.parseFromString(initxml, "application/xml");
    let bodyNode = XMLDOM.getElementsByTagName('body');
    

    let lastTagTextEnd = 0;
    for(tag of TagObjList){

        if(tag.Start != 0){
            var normalText = sentence.substr(lastTagTextEnd, tag.Start - lastTagTextEnd);
            var textTargetEle = XMLDOM.createTextNode(normalText);
            bodyNode[0].appendChild(textTargetEle);
            lastTagTextEnd = tag.End;
        }

        var seg = XMLDOM.createElement("segment");

        //child process
        if(tag.child != null){
            var firstTagText = sentence.substr(tag.Start, tag.child.Start - tag.Start);
            var newText=XMLDOM.createTextNode(firstTagText);
            seg.appendChild(newText);


            var segChild = XMLDOM.createElement("segment");

            //grand child
            if(tag.child.child != null){
                var firstTagText = sentence.substr(tag.child.Start, tag.child.child.Start - tag.child.Start);
                var newText = XMLDOM.createTextNode(firstTagText);
                segChild.appendChild(newText);


                var segGrandChild = XMLDOM.createElement("segment");
                //attach text to segment
                var tagText = sentence.substr(tag.child.child.Start, tag.child.child.End - tag.child.child.Start);
                var newText=XMLDOM.createTextNode(tagText);
                segGrandChild.appendChild(newText);

                segGrandChild.id = tag.child.child.ID;

                segGrandChild.setAttribute('features', tag.child.child.tag1st + ";" + tag.child.child.tag2nd);

                segGrandChild.setAttribute('state','active');
                segChild.appendChild(segGrandChild);


                var lastTagText = sentence.substr(tag.child.child.End, tag.child.End - tag.child.child.End);
                var newText=XMLDOM.createTextNode(lastTagText);
                segChild.appendChild(newText);
            }else{
                var tagText = sentence.substr(tag.child.Start, tag.child.End - tag.child.Start);
                var newText=XMLDOM.createTextNode(tagText);
                segChild.appendChild(newText);
            }

            segChild.id = tag.child.ID;

            segChild.setAttribute('features', tag.child.tag1st + ";" + tag.child.tag2nd);

            segChild.setAttribute('state','active');
            seg.appendChild(segChild);


            var lastTagText = sentence.substr(tag.child.End, tag.End - tag.child.End);
            var newText=XMLDOM.createTextNode(lastTagText);
            seg.appendChild(newText);
        }else{
            var tagText = sentence.substr(tag.Start, tag.End - tag.Start);
            var newText=XMLDOM.createTextNode(tagText);
            seg.appendChild(newText);
            lastTagTextEnd = tag.End;
        }

        //attach attributes to segment
        seg.id = tag.ID;
        seg.setAttribute('features', tag.tag1st + ';' + tag.tag2nd);


        seg.setAttribute('state','active');
        bodyNode[0].appendChild(seg);

    }

    if(lastTagTextEnd < mainSetence.length){
        var normalText = sentence.substr(lastTagTextEnd, mainSetence.length - lastTagTextEnd);
        var textTargetEle = XMLDOM.createTextNode(normalText);
        bodyNode[0].appendChild(textTargetEle);
        lastTagTextEnd = tag.End;
    }


    const outputGpx = new XMLSerializer();
    XMLdata = outputGpx.serializeToString(XMLDOM);

}

function SentenceHTMLGenerator(sentence, tag){
    HTMLdata = '';

    //タグがない場合の処理 
    if(tag == null){
        for(s of sentence.split('\n')){
            s = s.replace(/^\t/, "&#009;");
            HTMLdata = HTMLdata + '<pre class="NoSelected">' + s + '</pre>';
        }
        return;
    }

    // convert XML to HTML

    let parser = new DOMParser();
    let XMLDOM = parser.parseFromString(XMLdata, "application/xml");
    let bodyNode = XMLDOM.getElementsByTagName('body');
    let HTMLdataBuf = '';
    for(node of bodyNode[0].childNodes){

        if(node.nodeType == 3)//text
        {
            HTMLdataBuf += node.nodeValue;
        }
        else if(node.nodeType == 1)// segment
        {
            let tag1stLength = TagNames1st[0].length + 1;
            // console.log(node.childNodes[0].nodeValue, node.getAttributeNode("id").nodeValue);
            var attr  = node.getAttributeNode("features").nodeValue;
            var idNum = node.getAttributeNode("id").nodeValue;
            // var tagText = node.childNodes[0].nodeValue;
            var annNum = TagNames2nd.indexOf(attr.substring(tag1stLength, attr.length));
            HTMLdataBuf += "<span class=\"Annotation" + annNum.toString() + " AnnotationLevel1 TagNoSelected\" id=\"" + idNum + "\">";

            for(childNode of node.childNodes){
                if(childNode.nodeType == 3)HTMLdataBuf += childNode.nodeValue;
                else{
                    var attrChild  = childNode.getAttributeNode("features").nodeValue;
                    var idNumChild = childNode.getAttributeNode("id"      ).nodeValue;
                    // var tagText = node.childNodes[0].nodeValue;

                    var annNum = TagNames2nd.indexOf(attrChild.substring(tag1stLength, attrChild.length));
                    HTMLdataBuf += "<span class=\"Annotation" + annNum.toString() + " AnnotationLevel2 TagNoSelected\" id=\"" + idNumChild + "\">";

                    for(grandchildNode of childNode.childNodes){
                        if(grandchildNode.nodeType == 3)HTMLdataBuf += grandchildNode.nodeValue;
                        else{
                            console.log(grandchildNode);
                            var tagText = grandchildNode.childNodes[0].nodeValue;
                            var attrGrandChild  = grandchildNode.getAttributeNode("features").nodeValue;
                            var idNumGrandChild = grandchildNode.getAttributeNode("id"      ).nodeValue;

                            var annNum = TagNames2nd.indexOf(attrGrandChild.substring(tag1stLength, attrGrandChild.length));
                            HTMLdataBuf += "<span class=\"Annotation" + annNum.toString() + " AnnotationLevel3 TagNoSelected\"  id=\"" + idNumGrandChild + "\">" + tagText + "</span>";
                        }
                    }

                    HTMLdataBuf += "</span>";
                }
            }

            HTMLdataBuf += "</span>";
        }

    }

    // pタグの挿入

    lines = HTMLdataBuf.split('\n');
    HTMLdata = '';
    for(line of lines){
        // var spacePos = line.indexOf('\t');
        // if(spacePos != -1)line.replace('\t', '&emsp;'*(6-spacePos));
        line = line.replace(/^\t/, "&#009;");
        HTMLdata += "<pre class=\"NoSelected\">" + line + "</pre>\n";
    }
}

function SentenceXMLReverser(){

    let parser = new DOMParser();
    let XMLDOM = parser.parseFromString(XMLdata, "application/xml");
    let bodyNode = XMLDOM.getElementsByTagName('body');
    mainSetence = '';
    TagObjList = [];

    for(node of bodyNode[0].childNodes){

        if(node.nodeType == 3){
            var normText = node.nodeValue;
            normText = normText.replaceAll('\n','\r\n');// CRLFへの変換(XMLは\nになる)
            mainSetence += normText;
        }
        else if(node.nodeType == 1){
            var nodeStart = mainSetence.length;
            var nodeComment = '';

            for(childNode of node.childNodes){
                if(childNode.nodeType == 3) mainSetence += childNode.nodeValue;
                else{
                    var childnodeStart = mainSetence.length;
                    var childnodeComment = '';

                    for(grandchildNode of childNode.childNodes){
                        if(grandchildNode.nodeType == 3) mainSetence += grandchildNode.nodeValue;
                        else{
                            var grandchildnodeStart = mainSetence.length;
                            var grandchildnodeComment = '';

                            mainSetence += grandchildNode.childNodes[0].nodeValue;

                            var grandchildnodeEnd = mainSetence.length;
                            var grandchildAttr  = grandchildNode.getAttributeNode("features").nodeValue;
                            grandchildAttr = grandchildAttr.replace('prosub;', '');
                            var grandchildnodeID = grandchildNode.getAttributeNode("id").nodeValue;

                            AddTag(Filename, grandchildnodeID, grandchildnodeStart, grandchildnodeEnd, grandchildnodeComment, TagNames1st[0], grandchildAttr);
                        }
                    }

                    var childnodeEnd = mainSetence.length;
                    console.log(childNode);
                    var childAttr  = childNode.getAttributeNode("features").nodeValue;
                    childAttr = childAttr.replace('prosub;', '');
                    var childnodeID = childNode.getAttributeNode("id").nodeValue;

                    AddTag(Filename, childnodeID, childnodeStart, childnodeEnd, childnodeComment, TagNames1st[0], childAttr);
                }
            }

            var nodeEnd = mainSetence.length;
            var attr  = node.getAttributeNode("features").nodeValue;
            attr = attr.replace('prosub;', '');
            var nodeID = node.getAttributeNode("id").nodeValue;

            AddTag(Filename, nodeID, nodeStart, nodeEnd, nodeComment, TagNames1st[0], attr);

        }
    }
}

function FileGenerateHTML(){

    var head = "<!doctype html>\n\
    <html>\n\
    <head>\n\
    \t<meta charset=\"utf-8\">\
    \t<title>" + FilenameBox.value +" Annotation HTML</title>\n\
    \t<style>\n\
    \t" + cssTemp + "\n\
    \t</style>\n\
    </head>\n\
    <body>\n"

    var tail = "</body>\n</html>\n"

    var FileInfo = "<h1>" + FilenameBox.value + "</h1>\n\
                    <pre class=\"NoSelected\">Editor:\t" + EditorNameBox.value + "</pre>\n\
                    <pre class=\"NoSelected\">"+TagNames1st[0]+":\t"+TagNames2nd.map((name,i)=>" <span class=\"Annotation"+i.toString()+" AnnotationLevel1 TagNoSelected\">"+name+"</span>").join(",")+"</pre>\
                    <hr>\
                    "

    HTMLFileString = head + FileInfo + HTMLdata + tail;
    console.log(cssTemp);
}

function FileGenerateTEXT(){


    var head = "Subcorp\t\\Filename\tID\tStart\tEnd\tText\tComment\tRole\tParentID\tdoc_completeness\t"
    head += TagNames1st;
    for(var tagname of TagNames2nd){
        if(tagname != "null")head += "\t" + tagname;
    }
    head += "\n";



    var content = "";
    releaseTagObjTree();
    TagObjList.sort((a,b) => a.Start - b.Start)
    for(var tag of TagObjList){
        content += "Texts\t" + FilenameBox.value;

        content += "\t" + tag.ID.toString() + "\t" + tag.Start.toString() + "\t" + tag.End.toString() + "\t" + tag.Text + "\t" + tag.CommentRole + "\t";
        if(tag.ParentID) content += tag.ParentID.toString() + "\t";
        else content += "\t";

        if(tag.doc_completeness) content += tag.doc_completeness.toString() + "\t";
        else content += "\t";

        if(tag.tag1st)content += "\t1";
        else content += "\t0";

        for(var tagname of TagNames2nd){
            if(tagname != "null"){
                if(tagname == tag.tag2nd) content += "\t1";
                else content += "\t0";
            }
        }
        content += "\n";
    }
    makeTagObjTree();

    TEXTFileString = head + content;
    console.log(TEXTFileString);
}

function HTMLDownload(){
    FileGenerateHTML();
    // テキストファイルの内容
    var text = HTMLFileString;

    // Blob オブジェクトを作成
    var blob = new Blob([text], { type: "html/plain" });

    // URL を作成
    var url = URL.createObjectURL(blob);

    // ダウンロードするための a 要素を作成
    var a = document.createElement("a");
    a.download = FilenameBox.value.replace(/\.[^.]+$/, "") + ".html";
    a.href = url;
    a.click();

    // URL を解放する
    URL.revokeObjectURL(url);

}
function TEXTDownload(){
    FileGenerateTEXT();

    var text = mainSetence;

    var blob = new Blob([text], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = FilenameBox.value
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);



    var text = TEXTFileString;

    var blob = new Blob([text], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = FilenameBox.value.replace(/\.[^.]+$/, "") + "-raw.txt";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);

}
