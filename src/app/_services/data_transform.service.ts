import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ConfigurationService } from '../_services/configuration.service';
import { sendRequest } from '../_helpers/legacy';


@Injectable({
  providedIn: 'root'
})
export class DataTransformService {

  constructor(private http: HttpClient,
              private configService: ConfigurationService) {}

getDataTransformList(){
  let user = this.configService.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_transforms", bodyStr);
}
createDataTransform(name:string, script: string, outputType: string, requirements: string, parameters: string){
  console.log("send post request");
  let user = this.configService.getUser();
  let body = {token: user.token,name:name, outputType: outputType, script:script, requirements: requirements, parameters:parameters};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/add", bodyStr);
}
editDataTransform(data_transform_id: string, name:string, script: string, outputType: string, requirements: string, parameters: string) {
  let user = this.configService.getUser();
  let body: any = {token: user.token, data_transform_id: data_transform_id};
  body["script"] = script;
  body["name"] = name;
  body["requirements"] = requirements;
  body["outputType"] = outputType;
  body["parameters"] = parameters;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/edit", bodyStr);
}
getDataTransformInfo(data_transform_id: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/info", bodyStr);
}  
deleteDataTransform(data_transform_id: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  console.log("delete"+bodyStr);
  sendRequest(this.configService.getServerURL() + "data_transforms/remove", bodyStr, null, null);

} 

getDataTransformInputList(data_transform_id: string){
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_transforms/inputs", bodyStr);
}

createDataTransformInput(dataTransformID:string, dataType: string, isCollection: string){
  console.log("send post request");
  let user = this.configService.getUser();
  let body = {token: user.token,dataTransform:dataTransformID, dataType: dataType, isCollection: isCollection};
  let bodyStr = JSON.stringify(body);
  sendRequest(this.configService.getServerURL() + "data_transforms/inputs/add", bodyStr, null, null);
}

editDataTransformInput(data_transform_input_id: string, dataType:string,  isCollection: string) {
  let user = this.configService.getUser();
  let body: any = {token: user.token, data_transform_input_id: data_transform_input_id};
  body["dataType"] = dataType;
  body["isCollection"] = isCollection;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/inputs/edit", bodyStr);
}
getDataTransformInputInfo(data_transform_input_id: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_input_id: data_transform_input_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/inputs/info", bodyStr);
}  

deleteAllDataTransformInputs(data_transform_id: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_id: data_transform_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/inputs/removeall", bodyStr);

}  

deleteDataTransformInputs(data_transform_input_id: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_transform_input_id: data_transform_input_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/inputs/remove", bodyStr);

}  

runDataTransform(data_transform_id: string, exp_name: string, input_skeleton: string, output_id: string, input_data: Array<Array<string>>, output_skeleton: string, store_log: string, hparams: any, cluster_config?: any){
  
  let user = this.configService.getUser();
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
  return this.http.post<any>(this.configService.getServerURL() + "data_transforms/run", bodyStr);

}
}
