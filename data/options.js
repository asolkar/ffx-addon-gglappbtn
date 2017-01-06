// -----------------------------------------------
// Options UI and handling
// -----------------------------------------------
var default_applist = Object.keys(gapps_info).slice(0,9).join(',');

//
// Set applist falue from options form input into local storage
//
function save(e) {
  browser.storage.local.set({
    appList: document.querySelector("#appList").value
  });
  e.preventDefault();
}

//
// Restore default applist into local storage
//
function setdefault(e) {
  var setting = browser.storage.local.set({
    appList: default_applist
  });
  setting.then(function(items) {
    console.log("Defaults set");
    restore();
  })
  e.preventDefault();
}

//
// Restore applist value from local storage into form input
//
function restore() {
  function set(res) {
    console.log(res);
    document.querySelector("#appList").value = res.appList;
    applist_edit();
  }
  function onError(e) {
    console.log("Error getting appList setting, restoring defaults");
    console.log(e);
    setdefault();
  }
  var getting = browser.storage.local.get("appList");
  getting.then(set, onError);
}

//
// Colorize form input value based on correctness of app names and count
//
function validate_list(lst) {
  var sep = /\s*,\s*/;
  var apps = lst.split(sep);
  var val_arr = new Array();

  for (i = 0; i < apps.length; i++) {
    var cls = (i > 8) ? 'exc' :
              (gapps_info.hasOwnProperty(apps[i])) ?
                (((i>0) && (apps.slice(0,i).includes(apps[i]))) ? 'dup' : 'good') : 'bad';

    val_arr.push('<span class="' + cls + '">' + apps[i] + '</span>');
  }

  return val_arr.join(",");
}

//
// Handler for applist form input. Triggers validation of input text
//
function applist_edit(e) {
  document.querySelector("#applist-val").innerHTML = validate_list(document.querySelector("#appList").value);
}

//
// Main function for the options UI
//
$(function() {
  var ks = Object.keys(gapps_info);
  console.log("options.js - Entered");
  for (i=0,l=ks.length;i < l; i++) {
    key = ks[i];
    console.log(key)
    $("#supported_apps").append(
      $('<li>').attr('class', 'sa-name-cls')
               .data('sa-name', key).append(
                 $('<code>').append(
                    key
                 ), ": ", gapps_info[key]['desc'])
    );
  }

  $("#default_apps").append(default_applist);
});

//
// Register listeners
//
document.addEventListener("DOMContentLoaded", restore);
document.querySelector("form#values").addEventListener("submit", save);
document.querySelector("form#defs").addEventListener("submit", setdefault);
document.querySelector("#appList").addEventListener("keyup", applist_edit);
browser.storage.onChanged.addListener(restore);
