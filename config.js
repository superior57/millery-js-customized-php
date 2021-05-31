

let serverUri_arr = window.location.href.split("/");
serverUri_arr.pop();

const serverURL = serverUri_arr.join("/");
const prefix = serverURL.replace(window.location.origin, "");

$('form').each(function() {
    this.action = prefix + this.action.replace(window.location.origin, "");
})

