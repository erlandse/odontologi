var start = 0;
var pageSize = 10;
var pulpaselect = -1;
var apikalselect = -1;
var behandlingselect = -1;
var otherDiagnosesselect = -1;
var facetsSelected = -1;
var firstIndex = 0;
var secondIndex = 1;
var elasticResult = null;
function initialize() {
    $(document).ready(function () {
        // do jQuery
    });
    document.getElementById("facetselect").selectedIndex = 0;
    start = 0;
    initFillBoxes();
}
function lookup() {
    var q = "";
    var delimiter = "";
    var obj = JsonTool.createJsonPath("query");
    var d = JSON.parse("{\"must\":[]}");
    obj.query.bool = d;
    if (document.getElementById("facetsSelected").selectedIndex != -1) {
        var f = new Object();
        var o = new Object();
        f[document.getElementById("facetselect").value] = document.getElementById("facetsSelected").value;
        o.match = f;
        obj.query.bool.must.push(o);
    }
    if (document.getElementById("pulpaselect").selectedIndex != -1) {
        var f = new Object();
        var o = new Object();
        f.pulpalDiagnoses = document.getElementById("pulpaselect").value;
        o.match = f;
        obj.query.bool.must.push(o);
    }
    if (document.getElementById("apikalselect").selectedIndex != -1) {
        var f = new Object();
        var o = new Object();
        f.apicalDiagnoses = document.getElementById("apikalselect").value;
        o.match = f;
        obj.query.bool.must.push(o);
    }
    if (document.getElementById("behandlingselect").selectedIndex != -1) {
        var f = new Object();
        var o = new Object();
        f.typeOfTreatment = document.getElementById("behandlingselect").value;
        o.match = f;
        obj.query.bool.must.push(o);
    }
    if (document.getElementById("otherDiagnosesselect").selectedIndex != -1) {
        var f = new Object();
        var o = new Object();
        f.otherDiagnoses = document.getElementById("otherDiagnosesselect").value;
        o.match = f;
        obj.query.bool.must.push(o);
    }
    return obj;
}
function encodeValue(str) {
    return str.replace("+", "%2B");
}
function makeSearch() {
    var query = lookup();
    var url = "http://itfds-prod03.uio.no/elasticapi/odontologi/odontCase/_search";
    query.from = start;
    $.ajax({
        url: url,
        type: 'POST',
        data: query,
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            return;
        },
        success: function (data) {
            elasticResult = new ElasticClass(data);
            if (elasticResult.getDocCount() == 0) {
                document.getElementById("bla").innerHTML = "<h5 style='color:red'>No documents match the query - click t.ex Reset</h5>";
                document.getElementById("testtable").innerHTML = "";
            }
            else
                fillPortal();
        }
    });
}
function setZero() {
    document.getElementById("pulpaselect").selectedIndex = -1;
    pulpaselect = -1;
    document.getElementById("apikalselect").selectedIndex = -1;
    apikalselect = -1;
    document.getElementById("behandlingselect").selectedIndex = -1;
    behandlingselect = -1;
    document.getElementById("facetsSelected").selectedIndex = -1;
    document.getElementById("otherDiagnosesselect").selectedIndex = -1;
    otherDiagnosesselect = -1;
    facetsSelected = -1;
    start = 0;
    makeSearch();
}
function initFillBoxes() {
    var url = "http://itfds-prod03.uio.no/elasticapi/odontologi/odontCase/_search";
    var temp = 0;
    $.ajax({
        url: url,
        type: 'POST',
        data: aggs,
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            return;
        },
        success: function (data) {
            var el = new ElasticClass(data);
            var pulpal = el.getFacetFieldWithFacetName("pulpal");
            var sel = document.getElementById('pulpaselect');
            for (temp = 0; temp < pulpal.length; temp++)
                Tools.addOption(sel, pulpal[temp].key, pulpal[temp].key);
            var apical = el.getFacetFieldWithFacetName("apical");
            sel = document.getElementById('apikalselect');
            for (temp = 0; temp < apical.length; temp++)
                Tools.addOption(sel, apical[temp].key, apical[temp].key);
            var typeOfTreatment = el.getFacetFieldWithFacetName("typeOfTreatment");
            sel = document.getElementById('behandlingselect');
            for (temp = 0; temp < apical.length; temp++)
                Tools.addOption(sel, typeOfTreatment[temp].key, typeOfTreatment[temp].key);
            var otherDiagnoses = el.getFacetFieldWithFacetName("otherDiagnoses");
            sel = document.getElementById('otherDiagnosesselect');
            for (temp = 0; temp < otherDiagnoses.length; temp++)
                Tools.addOption(sel, otherDiagnoses[temp].key, otherDiagnoses[temp].key);
            makeSearch();
        }
    });
}
//        "field": "pulpalDiagnoses",
function fillFacet() {
    Tools.removeAllOptions("facetsSelected");
    if (document.getElementById('facetselect').selectedIndex == 0) {
        start = 0;
        makeSearch();
        return;
    }
    selectAgg.aggs.agg.terms.field = document.getElementById('facetselect').value;
    var url = "http://itfds-prod03.uio.no/elasticapi/odontologi/odontCase/_search";
    var temp = 0;
    $.ajax({
        url: url,
        type: 'POST',
        data: selectAgg,
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            return;
        },
        success: function (data) {
            var el = new ElasticClass(data);
            var agg = el.getFacetFieldWithFacetName("agg");
            var sel = document.getElementById('facetsSelected');
            for (temp = 0; temp < agg.length; temp++) {
                Tools.addOption(sel, agg[temp].key, agg[temp].key);
            }
            facetsSelected = -1;
            /*        start=0;
                    makeSearch();*/
            hideEmptySelectBoxes();
        }
    });
    var q = "q=*:*&wt=json&facet=true&facet.field=" + document.getElementById('facetselect').value + "&facet.limit=400&facet.sort=false&facet.mincount=0&rows=0&";
    //search   
}
function isNextPage() {
    if ((start + pageSize) < elasticResult.getDocCount())
        return true;
}
function isPrevPage() {
    if (start > 0)
        return true;
}
function nextAndPreviousButtons() {
    var form2 = "";
    form2 = "<form method='get' name='moveForm' accept-charset='UTF-8' >";
    form2 += "<table class='tableClass' border='0' cellpadding='2' cellspacing='2'>";
    form2 += "<tr><td colspan='1' style='text-align: left; height: 40px'>";
    if (isNextPage() || isPrevPage()) {
        if (isPrevPage()) {
            var s = start - pageSize;
            form2 += "<input type='button' class='forrige_neste' value='Previous' ";
            form2 += " onclick='move(" + s + ")'/> ";
        }
        if (isNextPage()) {
            var s = start + pageSize;
            form2 += "<input type='button' class='forrige_neste' value='Next' ";
            form2 += " onclick='move(" + s + ")'/>";
        }
        form2 += " " + getCountLabel();
    }
    return form2;
}
function move(newStart) {
    start = newStart;
    makeSearch();
}
function getCountLabel() {
    var countLabel = "";
    if (elasticResult.getDocCount() > 0) {
        if (start == 0)
            countLabel = "1";
        else
            countLabel = "" + start;
        countLabel += "-";
        if (isNextPage())
            countLabel += (start + pageSize);
        else
            countLabel += elasticResult.getDocCount();
        countLabel += " of " + elasticResult.getDocCount();
    }
    else {
        countLabel = "0 posts - search again";
    }
    return countLabel;
}
function getInternetExplorerVersion() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}
function getResultList() {
    var resultCode = "";
    var docs = elasticResult.getDocs();
    var pos;
    var preSpan = "<span style='color:red'>";
    var postSpan = "</span>";
    var options = document.getElementById('cloneselect').innerHTML;
    var firstSelect = "<select id='firstSelect' onchange='changeColumn()'>" + options + "</select>";
    var secondSelect = "<select id='secondSelect' onchange='changeColumn()'>" + options + "</select>";
    resultCode += "<tr class='trResult'><th class='thResult'>Case title</th><th class='thResult'>" + firstSelect + "</th><th class='thResult'>" + secondSelect + "</th><th class='thResult'>PDF document</th></tr>";
    for (var temp = 0; temp < docs.length; temp++) {
        resultCode += "<td class='tdBorder' style='text-align:left'>" + elasticResult.getSingleFieldFromDoc(docs[temp], "caseTitle") + "</td>";
        resultCode += "<td class='tdBorder'>" + getColumnValue(docs[temp], document.getElementById("cloneselect").options[firstIndex].value) + "</td>";
        resultCode += "<td class='tdBorder'>" + getColumnValue(docs[temp], document.getElementById("cloneselect").options[secondIndex].value) + "</td>";
        var year = elasticResult.getSingleFieldFromDoc(docs[temp], "publicationYear");
        var str = "<a target='_blank' href='http://nabu.usit.uio.no/odont/kasus/documents/" + year + "/" + elasticResult.getSingleFieldFromDoc(docs[temp], "caseBook") + "_" + elasticResult.getSingleFieldFromDoc(docs[temp], "caseNumber") + ".pdf'><img src='document.png'></a>";
        resultCode += "<td class='tdBorder'>" + str + "</td>";
        resultCode += "</tr>";
    }
    return resultCode;
}
function fillPortal() {
    //  alert(nextAndPreviousButtons());
    document.getElementById("bla").innerHTML = nextAndPreviousButtons();
    document.getElementById("testtable").innerHTML = "<table class='tableClass'>" + getResultList() + "</table>";
    document.getElementById("firstSelect").selectedIndex = firstIndex;
    document.getElementById("secondSelect").selectedIndex = secondIndex;
    hideEmptySelectBoxes();
}
function changeColumn() {
    firstIndex = document.getElementById("firstSelect").selectedIndex;
    secondIndex = document.getElementById("secondSelect").selectedIndex;
    document.getElementById("testtable").innerHTML = "<table class='tableClass'>" + getResultList() + "</table>";
    document.getElementById("firstSelect").selectedIndex = firstIndex;
    document.getElementById("secondSelect").selectedIndex = secondIndex;
}
function changeClick(selectName) {
    switch (selectName) {
        case "pulpaselect":
            if (pulpaselect == document.getElementById("pulpaselect").selectedIndex)
                document.getElementById("pulpaselect").selectedIndex = -1;
            pulpaselect = document.getElementById("pulpaselect").selectedIndex;
            break;
        case "apikalselect":
            if (apikalselect == document.getElementById("apikalselect").selectedIndex)
                document.getElementById("apikalselect").selectedIndex = -1;
            apikalselect = document.getElementById("apikalselect").selectedIndex;
            break;
        case "behandlingselect":
            if (behandlingselect == document.getElementById("behandlingselect").selectedIndex)
                document.getElementById("behandlingselect").selectedIndex = -1;
            behandlingselect = document.getElementById("behandlingselect").selectedIndex;
            break;
        case "facetsSelected":
            if (facetsSelected == document.getElementById("facetsSelected").selectedIndex)
                document.getElementById("facetsSelected").selectedIndex = -1;
            facetsSelected = document.getElementById("facetsSelected").selectedIndex;
            break;
        case "otherDiagnosesselect":
            if (otherDiagnosesselect == document.getElementById("otherDiagnosesselect").selectedIndex)
                document.getElementById("otherDiagnosesselect").selectedIndex = -1;
            otherDiagnosesselect = document.getElementById("otherDiagnosesselect").selectedIndex;
            break;
        default:
            break;
    }
    start = 0;
    makeSearch();
}
function hideEmptySelectBoxes() {
    var elements = document.getElementsByTagName('select');
    for (var temp = 0; temp < elements.length; temp++) {
        if (elements[temp].options.length == 0)
            elements[temp].style.display = 'none';
        else
            elements[temp].style.display = 'inline';
    }
}
function getColumnValue(doc, field) {
    switch (field) {
        case 'gender':
        case 'typeOfTreatment':
        case 'cbct':
        case 'preOperativeStatusOfTheTooth':
        case 'flareUp':
        case 'biopsy':
        case 'periodontitis':
        case 'taper':
        case 'apicalSize':
            return elasticResult.getSingleFieldFromDoc(doc, field);
        //        break;
        case 'disease':
        case 'medication':
        case 'quadrant':
        case 'pulpalDiagnoses':
        case 'apicalDiagnoses':
        case 'otherDiagnoses':
        case 'trauma':
        case 'symptoms':
        case 'preOperativeRestoration':
        case 'dentalAnomaly':
        case 'iatrogenicErrors':
        case 'instrumentationTecnique':
        case 'irrigation':
        case 'intervisitMedication':
        case 'numberOfVisits':
        case 'obturationTechnique':
        case 'obturationMaterial':
        case 'workingLength':
        case 'qualityOfRootFilling':
        case 'flapDesign':
        case 'postOpRestoration':
            var arr = elasticResult.getArrayFromDoc(doc, field);
            var delim = "";
            var str = "";
            for (var temp = 0; temp < arr.length; temp++) {
                str += delim + arr[temp];
                delim = ", ";
            }
            return str;
        //       break;
        default:
            return "";
    }
}
function elastic(body) {
    var url = "http://itfds-prod03.uio.no/elasticapi/odontologi/odontCase/_search";
    $.ajax({
        url: url,
        type: 'POST',
        data: body,
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            alert(JSON.stringify(data, null, 2));
            return data;
        }
    });
}
