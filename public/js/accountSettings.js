var counter = 0;

$(document).ready(function(){

    
    //when mouse is over one of the algorithm submenu buttons
    //  make it turn a darker color by toggling the hover class
    $(".submitButton").mouseenter(function(){
        $(this).toggleClass('submitButton_hover');
    });


    //when mouse leaves one of the algorithm submenu buttons
    //  make it turn back to its normal, light color
    $(".submitButton").mouseout(function(){
        $(this).toggleClass('submitButton_hover');
    });


    //hides all sub-menus of the algoriths settings on page load
    $('.algorithm-parameter-submenu').hide();


    //Turns the settings html elements into an accordion list using jQuery UI
    $(".settings-accordion-menu").accordion({
        collapsible: true, //allows all sections to be closed at the same time
        active: false,      //if false, all sections will be closed by default on page load
        heightStyle: "content" //the hieght of each section matches the height of its contents
    });


    //When one of the radio buttons at the top of the algorithms section is clicked
    $('.algoRadioButton').click(function()
    {
        $('.algorithm-parameter-submenu').hide(); //hide all algorithm parameter submenus
        //get the html ID of the submenu that belongs to the clicked radio button
        //  by getting the ID of the clicked button and adding # and ParaMenu to it
        //  to get the ID of the parameter submenu
        var subMenuID = '#' + $(this).attr('id') + 'ParamMenu';
        $(subMenuID).show(); //show the correct submenu
    });


    /* HOW TO CALL A FUNCTION AT A SET INTERVAL AND HOW TO CHANGE THE COLOR OF ELEMENTS

        var counter = 0;
        var foo = function() 
        {
            console.log($.now());
            var colors = ['green','orange'];
            var rand = colors[counter % 2];
            counter++;
            $(".submitButton").css("background-color",rand)
            $(".submitButton").css("border-color",rand)
        }
        setInterval(foo, 1000);
    */



});