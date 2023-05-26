
//src: https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript
export function sendRequest(url : string, data : any, callback?: any, callbackData?: any){
    var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
             if (this.readyState == 4 && this.status == 200) {
                if (callback == undefined){
                    console.log(this.responseText);  
                 }else{
                    callback(this.responseText, callbackData);
                }
             }
        };
  
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader( 'Access-Control-Allow-Origin', '*');
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(data);
  }


