// ==UserScript==
// @name           预览
// @namespace      http://tampermonkey.net/
// @version        0.1
// @description    detect code and view the cover
// @author         xshrim
// @include        *
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_setClipboard
// @grant          unsafeWindow
// @grant          window.close
// @grant          window.focus
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @require        http://code.jquery.com/jquery-2.1.1.min.js

// ==/UserScript==

// test url: http://who.ebeta.org/post/1582.html?page=all

//var $ = unsafeWindow.jQuery;
var $ = window.jQuery;

// cookie
/*
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ?
        "" :
        ";expires="+exdate.toUTCString() + ";path=/");
}

function delete_cookie( name ) {
      document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
*/

function mousePosition(ev){
    ev = ev || window.event;
    if(ev.pageX || ev.pageY){
        return {x:ev.pageX, y:ev.pageY};
    }
    return {
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y:ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function getVideoCode(title){
    /*
    var t = title.match(/[A-Za-z]+\-\d+/g);
    if(!t){
        t = title.match(/heyzo[\-\_]?\d{4}/g);
    }
    if(!t){
        t = title.match(/\d{6}[\-\_]\d{3}/g);
    }
    if(!t){
        t = title.match(/[A-Za-z]+\d+/g);
    }
    return t;
    */
    return title.match(/([A-Za-z0-9]+[\-\_]\d+)|(heyzo[\-\_]?\d{4})|(\d{6}[\-\_]\d{3})|([A-Za-z]+\d+)|(\d{5}[\-\_]\d{4})|(\d{5}[\-\_]\d{3})/g);
}

function getVideoInfo(id){
    $("#imgpoptitle").html(id);
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://avmoo.asia/cn/search/" + id,
        onload: xhr => {
            var xhr_data = $(xhr.responseText);

            if(!(xhr_data.find("div.alert").length)){
                var title = xhr_data.find("div.photo-info span").html();
                if (title !== undefined) {
                    $("#imgpopcontenttitle").html("<h4>" + title + "</h4>");
                }
                var img_url = xhr_data.find("div.photo-frame img").attr("src");
                if (img_url !== undefined) {
                    $("#imgpopcontentimg").attr("src", img_url.replace("ps.j","pl.j"));
                }
            }else{
                getUncensored(id);
            }
        }
    })
}

function getUncensored(id){
    $("#imgpoptitle").html(id);
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://avsox.asia/cn/search/" + id,
        onload: xhr => {
            var xhr_data = $(xhr.responseText);

            if(!(xhr_data.find("div.alert").length)){
                var title = xhr_data.find("div.photo-info span").html();
                $("#imgpopcontenttitle").html("<h4>" + title + "</h4>");
                var details_url = xhr_data.find("a.movie-box").attr("href");
                if (details_url !== undefined) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: details_url,
                        onload: temp => {
                            var img = $(temp.responseText).find("a.bigImage").attr("href");
                             $("#imgpopcontentimg").attr("src", img);
                        }
                    });
                }
            }
        }
    })
}

function createPop(left, top, removeable) {
    $("#imgpop").remove();

    var pop = document.createElement("div");
    var poptitle = document.createElement("div");
    //var poptitletext = document.createElement("span");
    var popcontent = document.createElement("div");
    var popcontenttitle = document.createElement("div");
    var popcontentimg = document.createElement("img");
    poptitle.id="imgpoptitle";
    popcontent.id="imgpopcontent";
    popcontenttitle.id="imgpopcontenttitle";
    popcontentimg.id="imgpopcontentimg";
    pop.id="imgpop";

    poptitle.style.cssText = "height:30px;width:100%;text-align:center;vertical-align:middle;font-size:14px;font-weight:bold;background:gray;cursor:move;";
    popcontenttitle.style.cssText = "max-width:800px;";
    //popcontenttitle.style.cssText = "height:30px;width:100%;background:red;";
    pop.style.cssText = "position:absolute;left:" + left + "px;top:" + top + "px;background:#f0f0f0;z-index:101;border:solid 2px #afccfe;";
    pop.appendChild(poptitle);

    popcontent.appendChild(popcontenttitle);
    popcontent.appendChild(popcontentimg);
    pop.appendChild(popcontent);

    if(removeable == true){
			var ismousedown = false;
			var popleft,poptop;
			var downX,downY;
			popleft = parseInt(pop.style.left);
			poptop = parseInt(pop.style.top);
			poptitle.onmousedown = function(e){
                ismousedown = true;
                downX = e.clientX;
                downY = e.clientY;
			}
			poptitle.onmousemove = function(e){
				if(ismousedown){
                    pop.style.top = e.clientY - downY + poptop + "px";
                    pop.style.left = e.clientX - downX + popleft + "px";
				}
			}
			/*松开鼠标时要重新计算当前窗口的位置*/
			poptitle.onmouseup = function(){
				popleft = parseInt(pop.style.left);
				poptop = parseInt(pop.style.top);
				ismousedown = false;
			}
		}

    return pop;
}

(function() {
    'use strict';
    var pretarget;

    document.body.onclick = function(event){
        //if (event.target.id !== "imgpop" && event.target.id !== "imgpoptitle" && event.target.id !== "imgpopcontent" && event.target.parentNode.id !== "imgpop" && event.target.parentNode.id !== "imgpoptitle" && event.target.parentNode.id !== "imgpopcontent") {
         if ($("#imgpop") !== undefined) {
             if (event.target.id != "imgpop" && event.target.parentNode.id != "imgpop" && event.target.parentNode.parentNode.id != "imgpop" && event.target.parentNode.parentNode.parentNode.id != "imgpop" && event.target.parentNode.parentNode.parentNode.parentNode.id != "imgpop") {
            //if ($("#imgpop") != event.target && !$.contains($("#imgpop"), event.target)) {
                $("#imgpop").remove();
            }
        }
    }

    document.body.onmouseover = function(event){
        if (!event.altKey) {
            return
        }

       if (event.target === pretarget) { // 鼠标移动但元素不变时无动作
           return
       }
        pretarget = event.target;
        //console.log('当前鼠标在', el, '元素上');//在控制台中打印该变量

        var mousePos = mousePosition(event)

       if (event.target.children.length <= 1) {
           var code = getVideoCode(event.target.innerText);
           if (code !== null && code !== undefined) {
               var pop = createPop(mousePos.x, mousePos.y, true);
               document.body.appendChild(pop);
               $.each(code ,function(index,value){
                   console.log("=====  ", value, "  =====");
                   getVideoInfo(value);
               });
           }
       }
    }
})(); 