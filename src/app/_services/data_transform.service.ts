import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { User } from '../_models/user';

//src: https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript
function sendRequest(url : string, data : any, callback?: any, callbackData?: any){
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


declare var $ :any;
@Injectable({
  providedIn: 'root'
})
export class DataTransformService {
  public activatePortForwarding: boolean = true;

  constructor(private http: HttpClient) { }

  getUser(): User{
    let userData = localStorage.getItem('currentUser');
    let user : User = new User();
    if(userData == null) return user;
    let userDict = JSON.parse(userData);
    user.token = userDict["token"];
    user.username = userDict["username"];
    user.role = userDict["role"];
    return user;
  }

  getServerURL(): string{
    let port = $('meta[name=port]').attr("content");
    let activatePortForwardingStr = $('meta[name=activatePortForwarding]').attr("content");
    let activatePortForwarding = (activatePortForwardingStr== "True");
    const hostname:string = window.location.hostname;
    const protocol:string = window.location.protocol;
    if(activatePortForwarding){
      return protocol + "//" + hostname + "/" + port;
    }
    else{
      return protocol + "//" + hostname + ":" + port + "/";
    }
  }

getDataTransformList(){
  let user = this.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_transforms", bodyStr);
}
createDataTransform(name:string, script: string, outputType: string, requirements: string, parameters: string){
  console.log("send post request");
  let user = this.getUser();
  let body = {token: user.token,name:name, outputType: outputType, script:script, requirements: requirements, parameters:parameters};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/add", bodyStr);
}
editDataTransform(data_transform_id: string, name:string, script: string, outputType: string, requirements: string, parameters: string) {
  let user = this.getUser();
  let body: any = {token: user.token, data_transform_id: data_transform_id};
  body["script"] = script;
  body["name"] = name;
  body["requirements"] = requirements;
  body["outputType"] = outputType;
  body["parameters"] = parameters;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.getServerURL() + "data_transforms/edit", bodyStr);
}
getDataTransformInfo(data_transform_id: string) {
  let user = this.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/info", bodyStr);
}  
deleteDataTransform(data_transform_id: string) {
  let user = this.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  console.log("delete"+bodyStr);
  sendRequest(this.getServerURL() + "data_transforms/remove", bodyStr, null, null);

}  


getDataTransformInputList(data_transform_id: string){
  let user = this.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_transforms/inputs", bodyStr);
}
createDataTransformInput(dataTransformID:string, dataType: string, isCollection: string){
  console.log("send post request");
  let user = this.getUser();
  let body = {token: user.token,dataTransform:dataTransformID, dataType: dataType, isCollection: isCollection};
  let bodyStr = JSON.stringify(body);
  sendRequest(this.getServerURL() + "data_transforms/inputs/add", bodyStr, null, null);
}
editDataTransformInput(data_transform_input_id: string, dataType:string,  isCollection: string) {
  let user = this.getUser();
  let body: any = {token: user.token, data_transform_input_id: data_transform_input_id};
  body["dataType"] = dataType;
  body["isCollection"] = isCollection;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.getServerURL() + "data_transforms/inputs/edit", bodyStr);
}
getDataTransformInputInfo(data_transform_input_id: string) {
  let user = this.getUser();
  let body = {token: user.token, data_transform_input_id: data_transform_input_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/inputs/info", bodyStr);
}  
deleteAllDataTransformInputs(data_transform_id: string) {
  let user = this.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/inputs/removeall", bodyStr);

}  
deleteDataTransformInputs(data_transform_input_id: string) {
  let user = this.getUser();
  let body = {token: user.token, data_transform_input_id: data_transform_input_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/inputs/remove", bodyStr);

}  

runDataTransform(data_transform_id: string, exp_name: string, input_skeleton: string, output_id: string, input_data: Array<Array<string>>, output_skeleton: string, store_log: string, hparams: any, cluster_config?: any){
  
  let user = this.getUser();
  let body: any = {token: user.token, data_transform_id: data_transform_id};
  body["exp_name"] = exp_name;
  body["input_skeleton"] = input_skeleton;
  body["output_skeleton"] = output_skeleton;
  body["output_id"] = output_id;
  body["input_data"] = input_data;
  body["store_log"] = store_log;
  body["hparams"] = hparams;
  if(cluster_config!=null){
    body["cluster_config"] = cluster_config;
  }
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/run", bodyStr);

}
}
