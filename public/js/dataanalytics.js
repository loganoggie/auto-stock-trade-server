function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
}

function getChildIndex(child){
    var parent = child.parentNode;
    var children = parent.children;
    var i = children.length - 1;
    for (; i >= 0; i--){
        if (child == children[i]){
            break;
        }
    }
    return i;
};

var selector = document.getElementsByClassName('graph-selector')[0];
var graphs = document.getElementsByClassName('graph-view');

selector.onclick = function(event) {
    var target = getEventTarget(event);
    for (i = 0; i < graphs.length; i++) {
      graphs[i].style.display = "none";
    }
    var graphToShow = graphs[getChildIndex(target)];
    graphToShow.style.display = "block";
};
