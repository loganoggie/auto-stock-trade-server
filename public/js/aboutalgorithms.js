// window.onload = function() {
//     tabcontent = document.getElementsByClassName("tab-wrapper");
//     for (i = 0; i < tabcontent.length; i++)
//     {
//         tabcontent[i].classList.remove("active");
//         tabcontent[i].classList.remove("inactive");
//     }

//     tabcontent[0].classList.add("active");
//     for (i = 1; i < tabcontent.length; i++)
//     {
//         tabcontent[i].classList.add("inactive");
//     }

// }




// function openAlgorithm(evt, AlgorithmName)
// {
//     // Declare all variables
//     var i, tabcontent, tablinks;


//     // Get all elements with class="tab-wrapper" and hide them
//     tabcontent = document.getElementsByClassName("tab-wrapper");
//     for (i = 0; i < tabcontent.length; i++)
//     {
//         tabcontent[i].classList.remove("active");
//         tabcontent[i].classList.remove("inactive");
//     }

//     // Get all elements with class="tablinks" and remove the class "active"
//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++)
//     {
//         tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }

//     // Show the current tab, and add an "active" class to the button that opened the tab
//     document.getElementById(AlgorithmName).style.display = "block";
//     evt.currentTarget.className += " active";
// }

// // Get the element with id="defaultOpen" and click on it
// document.getElementById("defaultOpen").click();

///////////////////////////////RYANS STUFF///////////////////////////////////////////////


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

var selector = document.getElementsByClassName('tab')[0];
var tablinks = document.getElementsByClassName('tablinks');
var tabs = document.getElementsByClassName('tab-wrapper');

selector.onclick = function(event) {
    var target = getEventTarget(event);
    for (i = 0; i < tabs.length; i++) {
      tabs[i].style.display = "none";
    }
    var tabToShow = tabs[getChildIndex(target)];
    tabToShow.style.display = "block";
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }
    tablinks[target].classList.add('active');
};

window.onload = function(event) {
    for (i = 0; i < tabs.length; i++) {
      tabs[i].style.display = "none";
    }
    var tabToShow = tabs[0];
    tabToShow.style.display = "block";
};