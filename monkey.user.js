// ==UserScript==
// @name         fluency
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  gg
// @author       You
// @match        https://fluency.bds.com/*
// @include            http*://fluency.bds.com/*
// @grant          GM_xmlhttpRequest
// @connect localhost
// @downloadURL   https://github.com/jingbosun/tampermonkeyscript/raw/main/monkey.user.js
// ==/UserScript==



var display = "";
var last_res = "";
var searchflag = false;
var didsearch = false;

//===================================================
function search_for_question(){

    var fromquestion = true;
    var opt_array = [];

    var qdiv = document.getElementById("divQuestionSubtitle");
    if (!qdiv){
        qdiv = document.getElementById("question");
        fromquestion = false;
    }
    var qsub = qdiv.textContent;
    qsub = qsub.replace(/[^a-z0-9]/gi, '');


    if (fromquestion){
        var tmp1 = document.getElementById("options");
        if (!tmp1){
            return [qsub, opt_array];
        }

        var num_options = document.getElementById("options").childElementCount;
        for (let i = 0; i < num_options; i++) {
            var labelid = "option"+i+"Label";
            opt_array.push(document.getElementById(labelid).textContent.replace(/[^a-z0-9]/gi, ''));
        }
    }else{

        var arr = document.getElementsByClassName("ReviewOption");
        if (!arr){
            return [qsub, opt_array];
        }
        for (let i = 0; i < arr.length; i++) {
            var obj = arr[i].children;
            for (let j = 0; j < obj.length; j++) {
                var str = obj[j].textContent;
                if (str == '' || str == 'X'){
                    continue;
                } else{
                    var res = str.replace(/[^a-z0-9]/gi, '');
                    if (res != 'CorrectOptions' && res != 'IncorrectOptions' && res !='YouSelected'){
                        opt_array.push(res);
                        console.log(res);
                    }
                }


            }



        }
    }

    return [qsub,opt_array];
}

//===================================================
function search_for_ans(){

    var fromquestion = true;
    var qdiv = document.getElementById("divQuestionSubtitle");
    if (!qdiv){
        qdiv = document.getElementById("question");
        fromquestion = false;
    }

    var selected_opt = [];
    if (fromquestion) {

        var tmp1 = document.getElementById("options");
        if (!tmp1){
            return selected_opt;
        }

        var num_options = document.getElementById("options").childElementCount;
        for (let i = 0; i < num_options; i++) {
            var labelid = "option"+i;
            if(document.getElementById(labelid).checked) {
                console.log(i+" checked");
                selected_opt.push(i);
            }
        }
    } else {

        var arr = document.getElementsByClassName("ReviewOption");
        if (!arr){
            return selected_opt;
        }

        var idx = 0;
        for (let i = 0; i < arr.length; i++) {
            var obj = arr[i];
            var res = obj.textContent.replace(/[^a-z0-9]/gi, '');
            if (res == 'CorrectOptionsYouSelected'){
                  continue;
            }
            else if (res == 'IncorrectOptions'){
                   break;
            } else{
               selected_opt.push(idx);
               idx+=1;
            }


        }
    }


    return selected_opt;

}
//===================================================


function save_func(){
    display.innerHTML = "";

    var saveradio = document.getElementById("saveradio");
    if(saveradio && !saveradio.checked) {return;}

    
    var res = search_for_question();
    var qsub = res[0];
    var opt_array = res[1];
    if (opt_array.length==0){return;}
    var selected_opt = search_for_ans();
    if (selected_opt.length==0){return;}
    var key = qsub;
    var answer = "";
    if (selected_opt.length == 0){
        display.innerHTML = "Nothing selected";
        return
    }
    for (let i = 0; i < selected_opt.length; i++) {
        if (i==0){
            answer+= opt_array[selected_opt[i]];
        } else {
            answer+= "99999"+opt_array[selected_opt[i]];
        }
    }
    opt_array.sort();
    for (let i = 0; i < opt_array.length; i++) {
        key+= opt_array[i];
    }
    var data_out = "action=save&key="+key;
    data_out += "&ans="+answer;
    send_request(data_out,"save");

     display.innerHTML = "saved";

}
//===================================================
function search_func(){

    display.innerHTML = "";
    var res = search_for_question();
    var qsub = res[0];
    var key = qsub;
    var opt_array = res[1];
    if (opt_array.length==0){return;}
    var old_array = search_for_question()[1];

    var selected_opt = search_for_ans();
    if (selected_opt.length==0){return;}
    opt_array.sort();
    for (let i = 0; i < opt_array.length; i++) {
        key+= opt_array[i];
    }
    var data_out = "action=search&key="+key;
    searchflag = false;
    send_request(data_out,"search");
    


}
//===================================================
function send_request(data_out,action){
    GM_xmlhttpRequest({
        method: "POST",
        url: "http://localhost:8000",
        data: data_out,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function(response) {
            last_res = response.responseText;

//===================================================
       if (action == 'search'){

      display.innerHTML = "";
    var old_array = search_for_question()[1];
    if (old_array.length==0){return;}
    var answers = response.responseText.split("99999");
    console.log(answers);
    for (let i = 0; i < answers.length; i++) {
        var ans= answers[i];
        for (let j = 0; j < old_array.length; j++) {
            var candi_opt= old_array[j];
            if (candi_opt == ans){
                var label = "option"+j+"Label";
                var tmp = document.getElementById(label);
                var option = tmp.textContent;
                var newstring = "<p style=\"color:blue\"><b>"+option+"</b></p>"
                const regex = new RegExp(option,'g');
                tmp.innerHTML = tmp.innerHTML.replace(regex,newstring); // it works
                var labelid = "option"+j;
                document.getElementById(labelid).checked= true;
            }
         }

    }}
  //===================================================





        }
    });
}
//===================================================
//===================================================

//=================================================
function delete_func(){
    var data_out = "action=delete";
    send_request(data_out,"delete");
    display.innerHTML = "deleted last saving"
}
//=================================================


function checkfeedback(){
    sleep(1000);
    var fb_obj = document.getElementById('feedbackModal');
    if (fb_obj.style.display == 'block'){  //error is made
        console.log('Selected wrong answer.');
        return false;
    } else {
        console.log('Selected correct answer.');
        return true;
    }
}


//=================================================
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
//=================================================

(function() {
    'use strict';
    window.addEventListener('load', function () {
        // check which page I am in right now.
        var questionpage = false;
        var reviewpage = false;
        var next_button = document.getElementById("btnNext");
        var sub_button  = document.getElementById("submitButton")
        if (next_button){
            reviewpage = true;
            questionpage = false;
        } else if (sub_button){
             reviewpage = false;
            questionpage = true;
        }

        if (reviewpage){
            save_func()
            document.getElementById("btnNext").addEventListener("mouseover",save_func);
            document.getElementById("btnReturn").addEventListener("mouseover",save_func);
            document.getElementById("btnModuleLog").addEventListener("mouseover",save_func);
            document.getElementById("btnBack").addEventListener("mouseover",save_func);
            document.getElementsByClassName("navbar-toggler")[0].addEventListener("mouseover",save_func);
            document.getElementById("btnNext").addEventListener("click",save_func);
            document.getElementById("btnReturn").addEventListener("click",save_func);
            document.getElementById("btnModuleLog").addEventListener("click",save_func);
            document.getElementById("btnBack").addEventListener("click",save_func);
            document.getElementsByClassName("navbar-toggler")[0].addEventListener("click",save_func);
            var linkarr = document.getElementsByClassName("nav-link");
            for (let i = 0; i < linkarr.length; i++) {
                linkarr[i].addEventListener("mouseover",save_func);
                linkarr[i].addEventListener("click",save_func);
            }
            return;
        } else if (questionpage){

            var zNode       = document.createElement ('div');
            zNode.innerHTML = ''
            +'<input type="checkbox" id="saveradio" name="fav_language" value="saving"><label for="saveradio">saving</label>'
            +'<button id="searchbtn" type="button"> solution </button>'
                    + '<span id="displayinfo"></span>'
                    ;



            document.getElementById("ModuleTitle").appendChild(zNode);
            document.getElementById("searchbtn").addEventListener("click",search_func);
            //document.getElementById("savebtn").addEventListener("click",save_func);
            //document.getElementById("deletelastbtn").addEventListener("click",delete_func);
            display = document.getElementById("displayinfo");
            document.getElementById("submitButton").addEventListener("click",save_func);
            document.getElementById("saveradio").checked = true;
            //document.getElementById("submitButton").parentElement.innerHTML += zNode.innerHTML;

        }





    })
    //'<button id="savebtn" type="button">'
 //+ 'save </button><button id="searchbtn" type="button"> search </button>'
//+ '<button id="deletelastbtn" type="button"> delete last save </button>'
})();
