import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { CollectionNode } from '../_models/collections'
import { AuthenticationService } from '../_services/authentication.service'
import { saveAs } from 'file-saver';
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



//uses https://github.com/eligrey/FileSaver.js
function saveToFile(responseText: string, motionName: string){
  var data = new Blob([responseText], {type: "application/text"});
  saveAs(data, motionName);
}
declare var jquery:any;
declare var $ :any;
@Injectable({
  providedIn: 'root'
})
export class DataService {
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

  getMetaInformation(){
    return this.http.post(this.getServerURL() + "get_meta_data", null);
  }

  
  
  queryCollectionList(parentID: string){
    let user = this.getUser();
    let parentIDStr = String(parentID);
    return this.http.post<CollectionNode[]>(this.getServerURL() + "get_collection_list", '{"parent_id": "'+parentIDStr+'", "token":"'+user.token+'"}');
  }
 

  getSkeletonModels(){
    return this.http.post(this.getServerURL() + "get_skeleton_list", null);
   }

   getFileList(skeletonName: string, collectionID?: string, tags?:Array<string>){
    
    let body =  {collection:collectionID, skeleton:skeletonName, tags: tags};
    let bodyStr = JSON.stringify(body)
    return this.http.post(this.getServerURL() + "files", bodyStr);
  }

  addFile(collectionID: string, skeleton: string, name: string, dataType:string,  data: ArrayBuffer){
    //https://gist.github.com/nuclearglow/ab251744db0ebddd504eea28153eb279    
    
    let user = this.getUser();
    let body = {collection:collectionID, dataType: dataType, user:user.username, token: user.token, name:name, skeleton: skeleton, data: Array.from(new Uint8Array(data))};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.getServerURL() + "files/add", bodyStr);
  }

  deleteFile(file_id: string){
    console.log("call delete", file_id);
    
    let user = this.getUser();
    let body = {file_id: file_id,  user:user.username, token:  user.token};
    return this.http.post(this.getServerURL() + "files/remove", JSON.stringify(body));
  }

  getMotionList(skeletonName: string, collectionID?: string){
    if(collectionID == undefined){
        return this.http.post(this.getServerURL() + "get_motion_list",
            '{"skeleton":"' +skeletonName+'", "collection_id":"0"}');
    }
    else{
        return this.http.post(this.getServerURL() + "get_motion_list",
            '{"skeleton":"' +skeletonName+'", "collection_id":"'+collectionID+'"}');
    }
  }

  getMotionInfo(motionList : Array<any>){
    let columnList = ["ID", "numFrames"];
    let idList = [];
    for(var i = 0; i < motionList.length; i++){
      idList.push(motionList[i][0]);
    }
    let columnListStr = JSON.stringify(columnList);
    let idListStr = JSON.stringify(idList);
    return this.http.post(this.getServerURL() + "get_motion_info",
    '{"columns":' +columnListStr+', "clip_ids":'+idListStr+'}');
  }

  getModelList(skeletonName: string, collectionID?: string){
    if(collectionID == undefined){
        return this.http.post(this.getServerURL() + "get_model_list",
            '{"skeleton":"'+skeletonName+'", "collection_id":"0"}');
    }
    else{
        return this.http.post(this.getServerURL() + "get_model_list",
            '{"skeleton":"' +skeletonName+'", "collection_id":"'+collectionID+'"}');
    }
  }

  getGraphList(skeletonName: string){
      return this.http.post(this.getServerURL() + "get_graph_list",
          '{"skeleton":"'+skeletonName+'"}');
  }

  deleteClip(clipID: string){
    console.log("call delete", clipID);
    
    let user = this.getUser();
    let c = undefined
    let body = {clip_id: clipID,  user:user.username, token:  user.token};
    sendRequest(this.getServerURL() + "delete_motion", JSON.stringify(body), c, null);
    /*
    return this.http.post(this.getServerURL() + "delete_motion",
        '{"clip_id":"'+clipID+'"}');*/
  }

  removeCollection(collectionID: string){
    let user = this.getUser();
    let body = {id: collectionID,  user:user.username, token:  user.token};
    //let c = undefined
    //sendRequest(this.getServerURL() + "remove_collection", JSON.stringify(body), c, null);
    return this.http.post(this.getServerURL() + "remove_collection", JSON.stringify(body));
  }

  createCollection(parentID: string, collectionName: string, collectionType: string){
    let user = this.getUser();
    let body = {name: collectionName, parent_id: parentID, type:collectionType, user:user.username, token: user.token};
    return this.http.post(this.getServerURL() + "create_new_collection", JSON.stringify(body));
  }

  uploadBVHClip(collectionID: string, skeleton: string, name: string, data: string, callback: any){
    let user = this.getUser();
    let body =  {collection:collectionID, name:name, skeleton:skeleton, bvh_data: data, user:user.username, token: user.token}
    sendRequest(this.getServerURL() + "upload_bvh_clip",JSON.stringify(body), callback, null);
    /*return this.http.post(this.getServerURL() + "upload_bvh_clip",
        '{"collection":"'+collectionID+'", "name": "'+name+'", "bvh_data": "'+data+'"}');*/
  }

  downloadClipAsBVH(clipID: string, name: string){
    if (!name.endsWith(".bvh")){
       name = name+".bvh";
    }
    sendRequest(this.getServerURL() + "download_bvh", '{"clip_id":"'+clipID+'"}', saveToFile, name);
  }

  downloadSampleAsBVH(modelID: string, name: string){
    sendRequest(this.getServerURL() + "download_sample_as_bvh", '{"model_id":"'+modelID+'"}', saveToFile, name+"_sample.bvh");
  }

  downloadFile(fileID: string, name: string){
    
    let user = this.getUser();
    let body = {file_id: fileID,  user:user.username, token:  user.token};
    sendRequest(this.getServerURL() + "files/download", JSON.stringify(body), saveToFile, name);
  }

  uploadSkeleton(skeletonName: string, input_data: string, callback: any){
    let user = this.getUser();
    let body =  {name:skeletonName, data: input_data, user:user.username, token: user.token, data_type: "bvh"}
    sendRequest(this.getServerURL() + "create_new_skeleton", JSON.stringify(body), callback, null);
  }

  deleteSkeleton(skeletonName: string, callback: any=null){
    console.log("call delete", skeletonName);
    let user = this.getUser();
    let c = callback
    let body = {name: skeletonName,  user:user.username, token:  user.token};
    sendRequest(this.getServerURL() + "remove_skeleton", JSON.stringify(body), c, null);
  }

  startJob(name: string, cmd: string ){
    console.log("send post request");
    let user = this.getUser();
    let body = '{"name":"'+name+'", "cmd":"'+cmd+'", "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "servers/start", body, null, null);
  }
 
  createProject(name: string, is_public: boolean){
    console.log("send post request");
    let user = this.getUser();
    var pStr = is_public? "1":"0";
    let body = '{"project_name":"'+name+'", "token":"'+user.token+'",  "is_public": '+pStr+ '}';
    sendRequest(this.getServerURL() + "projects/add", body, null, null);
  }
  
  editProject(group_id: string, name: string, is_public: boolean,users: any){
    console.log("send post request");
    let user = this.getUser();
    var pStr = is_public? "1":"0";
    let body = '{"project_id":"'+group_id+'", "project_name":"'+name+'", "is_public": '+pStr+ ',"users":'+JSON.stringify(users) +', "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "projects/edit", body, null, null);
  }
  
  getServerList(){
    return this.http.get(this.getServerURL() + "servers");
  }
  
  getProjectList(){
    
    let user = this.getUser();
    let body = {token: user.token};
    return this.http.post(this.getServerURL() + "projects", body);

    //return this.http.get(this.getServerURL() + "projects");
  }
  
  getUserList(){
    return this.http.get(this.getServerURL() + "users");
  }

  getProjectMemberList(project_id : string){
    let body = '{"project_id":"'+project_id+'"}';
    return this.http.post(this.getServerURL() + "project_members", body);
  }

  deleteProject(project_id: string){
    let user = this.getUser();
    let body = '{"project_id":"'+project_id+'", "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "projects/remove", body, null, null);
  }

    
  createUser(name: string, email: string, password: string) {
      let createUserUrl = this.getServerURL() + "users/add"
      let role = "user";
      return this.http.post<any>(createUserUrl, { name, password, role, email });
  }

  editUser(name: string, password: string, email: string, role: string, project_list: any, user_id : string) {
    let editUserUrl = this.getServerURL() + "users/edit"
    let user = this.getUser();
    let body: any = {token: user.token};
    if (name != "")body["name"] = name;
    if (email != "")body["email"] = email;
    if (role != "")body["role"] = role;
    if (password != "")body["password"] = password;
    if (project_list != null)body["project_list"] = project_list;
    if (user_id  != "")body["user_id"] = user_id ; 
    let bodyStr = JSON.stringify(body);
   
    //return this.http.post(editUserUrl, bodyStr);
    return sendRequest(editUserUrl, bodyStr, null, null);
  }
  
  editUserPipe(name: string, password: string, email: string, role: string, project_list: any, user_id : string) {
    let editUserUrl = this.getServerURL() + "users/edit"
    let user = this.getUser();
    let body: any = {token: user.token};
    if (name != "")body["name"] = name;
    if (email != "")body["email"] = email;
    if (role != "")body["role"] = role;
    if (password != "")body["password"] = password;
    if (project_list != null)body["project_list"] = project_list;
    if (user_id  != "")body["user_id"] = user_id ; 
    let bodyStr = JSON.stringify(body);
    return this.http.post(editUserUrl, bodyStr);
  }

  getUserInfo(user_id: string) {
    let editUserUrl = this.getServerURL() + "users/info"
    let user = this.getUser();
    let body = '';
    if (user_id != ""){
      body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    }else{
      body = '{"token":"'+user.token+'"}';
    }
    return this.http.post(editUserUrl, body);
  }
  getProjectInfo(project_id: string) {
    let editProjectUrl = this.getServerURL() + "projects/info"
    let body = '{"project_id":"'+project_id+'"}';
    return this.http.post(editProjectUrl, body);
  }

  deleteUser(user_id: string) {
    console.log("delete user"+user_id);
    let user = this.getUser();
    let body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "users/remove", body, null, null);
    
  }


  uploadCharacter(name: string, skeleton_type: string, data: ArrayBuffer, callback? : any){
    //https://gist.github.com/nuclearglow/ab251744db0ebddd504eea28153eb279    
    let user = this.getUser();
    let body = {user:user.username, token: user.token, name:name, skeleton_type: skeleton_type, data: Array.from(new Uint8Array(data))};
    let bodyStr = JSON.stringify(body);
    sendRequest(this.getServerURL() + "upload_character_model", bodyStr, callback, null);
  }

  
  getCharacterModels(skeleton_type: string){
    let user = this.getUser();
    let body = {user:user.username, token: user.token, skeleton_type: skeleton_type};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.getServerURL() + "get_character_model_list", bodyStr);
   }

   deleteCharacter(skeleton_type: string, character_name: string, callback? : any) {
    console.log("delete character"+character_name);
    let user = this.getUser();
    let body = {token: user.token, name:character_name, skeleton_type: skeleton_type};
    let bodyStr = JSON.stringify(body);
    sendRequest(this.getServerURL() + "delete_character_model", bodyStr, callback, null);
    
  }

  getUserProjectList(user_id : string){
    let user = this.getUser();
    let body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    return this.http.post(this.getServerURL() + "user/projects", body);
  }

  getExperimentList(collection_id: string){
    let user = this.getUser();
    let body = {token: user.token, collection: collection_id};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.getServerURL() + "experiments", bodyStr);
  }
  deleteExperiment(exp_id: string) {
   let user = this.getUser();
   let body = {token: user.token, experiment_id: exp_id};
   let bodyStr = JSON.stringify(body);
   sendRequest(this.getServerURL() + "experiments/remove", bodyStr, null, null);
   
 }  
 
 getExperimentLog(exp_id: string){
  let user = this.getUser();
  let body = {token: user.token, experiment_id: exp_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "experiments/log", bodyStr);
} 
getExperimentInfo(exp_id: string){
  let user = this.getUser();
  let body = {token: user.token, experiment_id: exp_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "experiments/info", bodyStr);
}

downloadModel(modelID: string, name: string){
  if (!name.endsWith(".zip")){
     name = name+".zip";
  }
  let user = this.getUser();
  let body = {token: user.token, model_id: modelID};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "models/download", bodyStr,  {observe: 'response', responseType: 'blob'}).subscribe((res: any)=>{
    saveAs(res.body, name);
  });

}
createDataType(name: string, requirements: string){
  console.log("send post request");
  let user = this.getUser();
  let body = {token: user.token, name: name, requirements: requirements};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_types/add", bodyStr);
}

editDataType(data_type:string, newName: string, requirements: string) {
  let user = this.getUser();
  let body: any = {token: user.token, data_type: data_type};
  body["name"] = newName;
  body["requirements"] = requirements;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.getServerURL() + "data_types/edit", bodyStr);
}

getDataTypeList(){
  let user = this.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_types", bodyStr);
}
deleteDataType(data_type: string) {
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_types/remove", bodyStr);
  
}  
getDataTypeInfo(data_type: string) {
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_types/info", bodyStr);
}  


getTagList(){
  let user = this.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "tags", bodyStr);
}

addDataTag(tag :string){
  let user = this.getUser();
  let body = {token: user.token, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "tags/add", bodyStr);
}

renameDataTag(oldTag:string, newTag :string){
  let user = this.getUser();
  let body = {token: user.token, old_tag: oldTag, new_tag: newTag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "tags/rename", bodyStr);
}

removeDataTag(tag :string){
  let user = this.getUser();
  let body = {token: user.token, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "tags/remove", bodyStr);
}

getDataTypeTagList(data_type: string){
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_types/tags", bodyStr);
}

addDataTypeTag(data_type: string, tag :string){
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type, tag: tag};
  let bodyStr = JSON.stringify(body);
  
  // sendRequest(this.getServerURL() + "data_types/tags/add", bodyStr, null, null);
 return this.http.post(this.getServerURL() + "data_types/tags/add", bodyStr);
}

removeDataTypeTag(data_type: string, tag :string){
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_types/tags/remove", bodyStr);
}

removeAllDataTypeTags(data_type: string){
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_types/tags/removeall", bodyStr);

}

createDataLoader(dataType: string, engine: string, script: string, requirements: string){
  console.log("send post request");
  let user = this.getUser();
  let body = {token: user.token,engine:engine, dataType: dataType, script:script, requirements: requirements};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_loaders/add", bodyStr);
}

editDataLoader(dataType: string, engine: string, script: string, requirements: string) {
  let user = this.getUser();
  let body: any = {token: user.token, data_type: dataType, engine:engine};
  body["script"] = script;
  body["requirements"] = requirements;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return sendRequest(this.getServerURL() + "data_loaders/edit", bodyStr, null, null);
}

getDataLoaderList(){
  let user = this.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_loaders", bodyStr);
}
deleteDataLoader(data_type: string, engine: string) {
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type, engine:engine};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.getServerURL() + "data_loaders/remove", bodyStr);

}  
getDataLoaderInfo(data_type: string, engine: string) {
  let user = this.getUser();
  let body = {token: user.token, data_type: data_type, engine:engine};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_loaders/info", bodyStr);
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

runDataTransform(data_transform_id: string, exp_name: string, skeleton_type: string, output_id: string, input_data: Array<Array<string>>, store_log: string, hparams: any){
  
  let user = this.getUser();
  let body: any = {token: user.token, data_transform_id: data_transform_id};
  body["exp_name"] = exp_name;
  body["skeleton_type"] = skeleton_type;
  body["output_id"] = output_id;
  body["input_data"] = input_data;
  body["store_log"] = store_log;
  body["hparams"] = hparams;
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.getServerURL() + "data_transforms/run", bodyStr);

}
}
