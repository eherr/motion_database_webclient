import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { CollectionNode } from '../_models/collections'
import { saveAs } from 'file-saver';
import {ConfigurationService} from '../_services/configuration.service';


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

  constructor(private http: HttpClient, private configService: ConfigurationService) { }





  getMetaInformation(){
    return this.http.post(this.configService.getServerURL() + "get_meta_data", null);
  }

  
  
  queryCollectionList(parentID: string){
    let user = this.configService.getUser();
    let parentIDStr = String(parentID);
    return this.http.post<CollectionNode[]>(this.configService.getServerURL() + "get_collection_list", '{"parent_id": "'+parentIDStr+'", "token":"'+user.token+'"}');
  }
 

  getSkeletonModels(){
    return this.http.post(this.configService.getServerURL() + "get_skeleton_list", null);
   }

   getFileList(skeletonName: string, collectionID?: string, tags?:Array<string>){
    
    let body =  {collection:collectionID, skeleton:skeletonName, tags: tags};
    let bodyStr = JSON.stringify(body)
    return this.http.post(this.configService.getServerURL() + "files", bodyStr);
  }

  addFile(collectionID: string, skeleton: string, name: string, dataType:string,  data: ArrayBuffer){
    //https://gist.github.com/nuclearglow/ab251744db0ebddd504eea28153eb279    
    
    let user = this.configService.getUser();
    let body = {collection:collectionID, dataType: dataType, user:user.username, token: user.token, name:name, skeleton: skeleton, data: Array.from(new Uint8Array(data))};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.configService.getServerURL() + "files/add", bodyStr);
  }

  replaceFile(file_id: string, collectionID?: string, skeleton?: string, name?: string, dataType?:string, data?: ArrayBuffer){
    let user = this.configService.getUser();
    let body: any = {file_id: file_id,token: user.token};
    if (name != undefined)body["name"] = name;
    if (collectionID != undefined)body["collectionID"] = collectionID;
    if (skeleton != undefined)body["skeleton"] = skeleton;
    if (dataType != undefined)body["dataType"] = dataType;
    if (data!== undefined)body["data"] = Array.from(new Uint8Array(data));
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.configService.getServerURL() + "files/replace", bodyStr);
  }

  deleteFile(file_id: string){
    console.log("call delete", file_id);
    
    let user = this.configService.getUser();
    let body = {file_id: file_id,  user:user.username, token:  user.token};
    return this.http.post(this.configService.getServerURL() + "files/remove", JSON.stringify(body));
  }

  getMotionList(skeletonName: string, collectionID?: string){
    if(collectionID == undefined){
        return this.http.post(this.configService.getServerURL() + "get_motion_list",
            '{"skeleton":"' +skeletonName+'", "collection_id":"0"}');
    }
    else{
        return this.http.post(this.configService.getServerURL() + "get_motion_list",
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
    return this.http.post(this.configService.getServerURL() + "get_motion_info",
    '{"columns":' +columnListStr+', "clip_ids":'+idListStr+'}');
  }

  getModelList(skeletonName: string, collectionID?: string){
    if(collectionID == undefined){
        return this.http.post(this.configService.getServerURL() + "get_model_list",
            '{"skeleton":"'+skeletonName+'", "collection_id":"0"}');
    }
    else{
        return this.http.post(this.configService.getServerURL() + "get_model_list",
            '{"skeleton":"' +skeletonName+'", "collection_id":"'+collectionID+'"}');
    }
  }

  getModelGraphList(skeletonName: string, projectID: number){
    let body = {skeleton: skeletonName,  project_id:projectID,};
      return this.http.post(this.configService.getServerURL() + "model_graphs",JSON.stringify(body));
  }

  removeModelGraph(graphID: string){
    let user = this.configService.getUser();
    let body = {id: graphID,  user:user.username, token:  user.token};
    return this.http.post(this.configService.getServerURL() + "model_graphs/remove", JSON.stringify(body));
  }

  getModelGraph(graphID: string){
    let user = this.configService.getUser();
    let body = {id: graphID,  user:user.username, token:  user.token};
    return this.http.post(this.configService.getServerURL() + "model_graphs/download", JSON.stringify(body));
  }
  addModelGraph(name: string, project: number,skeleton: string, data: any){
    let user = this.configService.getUser();
    let body = {name:name, project:project, skeleton:skeleton, data: data, user:user.username, token:  user.token};
    return this.http.post(this.configService.getServerURL() + "model_graphs/add", JSON.stringify(body));

  }

  editModelGraph(graphID: string, name: string, data: any){
    let user = this.configService.getUser();
    let body = {id: graphID,  name:name, data: data, user:user.username, token:  user.token};
    return this.http.post(this.configService.getServerURL() + "model_graphs/edit", JSON.stringify(body));

  }

  deleteClip(clipID: string){
    console.log("call delete", clipID);
    
    let user = this.configService.getUser();
    let c = undefined
    let body = {clip_id: clipID,  user:user.username, token:  user.token};
    sendRequest(this.configService.getServerURL() + "delete_motion", JSON.stringify(body), c, null);
    /*
    return this.http.post(this.config.getServerURL() + "delete_motion",
        '{"clip_id":"'+clipID+'"}');*/
  }

  removeCollection(collectionID: string){
    let user = this.configService.getUser();
    let body = {id: collectionID,  user:user.username, token:  user.token};
    //let c = undefined
    //sendRequest(this.config.getServerURL() + "remove_collection", JSON.stringify(body), c, null);
    return this.http.post(this.configService.getServerURL() + "remove_collection", JSON.stringify(body));
  }

  createCollection(parentID: string, collectionName: string, collectionType: string){
    let user = this.configService.getUser();
    let body = {name: collectionName, parent_id: parentID, type:collectionType, user:user.username, token: user.token};
    return this.http.post(this.configService.getServerURL() + "create_new_collection", JSON.stringify(body));
  }

  uploadBVHClip(collectionID: string, skeleton: string, name: string, data: string, callback: any){
    let user = this.configService.getUser();
    let body =  {collection:collectionID, name:name, skeleton:skeleton, bvh_data: data, user:user.username, token: user.token}
    sendRequest(this.configService.getServerURL() + "upload_bvh_clip",JSON.stringify(body), callback, null);
    /*return this.http.post(this.config.getServerURL() + "upload_bvh_clip",
        '{"collection":"'+collectionID+'", "name": "'+name+'", "bvh_data": "'+data+'"}');*/
  }

  downloadClipAsBVH(clipID: string, name: string){
    if (!name.endsWith(".bvh")){
       name = name+".bvh";
    }
    sendRequest(this.configService.getServerURL() + "download_bvh", '{"clip_id":"'+clipID+'"}', saveToFile, name);
  }

  downloadSampleAsBVH(modelID: string, name: string){
    sendRequest(this.configService.getServerURL() + "download_sample_as_bvh", '{"model_id":"'+modelID+'"}', saveToFile, name+"_sample.bvh");
  }

  downloadFile(fileID: string, name: string){
    
    let user = this.configService.getUser();
    let body = {file_id: fileID,  user:user.username, token:  user.token};
    sendRequest(this.configService.getServerURL() + "files/download", JSON.stringify(body), saveToFile, name);
  }

  uploadSkeleton(skeletonName: string, input_data: string, callback: any){
    let user = this.configService.getUser();
    let body =  {name:skeletonName, data: input_data, user:user.username, token: user.token, data_type: "bvh"}
    sendRequest(this.configService.getServerURL() + "create_new_skeleton", JSON.stringify(body), callback, null);
  }

  deleteSkeleton(skeletonName: string, callback: any=null){
    console.log("call delete", skeletonName);
    let user = this.configService.getUser();
    let c = callback
    let body = {name: skeletonName,  user:user.username, token:  user.token};
    sendRequest(this.configService.getServerURL() + "remove_skeleton", JSON.stringify(body), c, null);
  }

  startJob(name: string, cmd: string ){
    console.log("send post request");
    let user = this.configService.getUser();
    let body = '{"name":"'+name+'", "cmd":"'+cmd+'", "token":"'+user.token+'"}';
    sendRequest(this.configService.getServerURL() + "servers/start", body, null, null);
  }
 
  createProject(name: string, is_public: boolean){
    console.log("send post request");
    let user = this.configService.getUser();
    var pStr = is_public? "1":"0";
    let body = '{"project_name":"'+name+'", "token":"'+user.token+'",  "is_public": '+pStr+ '}';
    sendRequest(this.configService.getServerURL() + "projects/add", body, null, null);
  }
  
  editProject(group_id: string, name: string, is_public: boolean,users: any){
    console.log("send post request");
    let user = this.configService.getUser();
    var pStr = is_public? "1":"0";
    let body = '{"project_id":"'+group_id+'", "project_name":"'+name+'", "is_public": '+pStr+ ',"users":'+JSON.stringify(users) +', "token":"'+user.token+'"}';
    sendRequest(this.configService.getServerURL() + "projects/edit", body, null, null);
  }
  
  getServerList(){
    return this.http.get(this.configService.getServerURL() + "servers");
  }
  
  getProjectList(){
    
    let user = this.configService.getUser();
    let body = {token: user.token};
    return this.http.post(this.configService.getServerURL() + "projects", body);

    //return this.http.get(this.config.getServerURL() + "projects");
  }
  
  getUserList(){
    return this.http.get(this.configService.getServerURL() + "users");
  }

  getProjectMemberList(project_id : string){
    let body = '{"project_id":"'+project_id+'"}';
    return this.http.post(this.configService.getServerURL() + "project_members", body);
  }

  deleteProject(project_id: string){
    let user = this.configService.getUser();
    let body = '{"project_id":"'+project_id+'", "token":"'+user.token+'"}';
    sendRequest(this.configService.getServerURL() + "projects/remove", body, null, null);
  }

    
  createUser(name: string, email: string, password: string) {
      let createUserUrl = this.configService.getServerURL() + "users/add"
      let role = "user";
      return this.http.post<any>(createUserUrl, { name, password, role, email });
  }

  editUser(user_id : string, name?: string, password?: string, email?: string, role?: string, project_list?: any) {
    let editUserUrl = this.configService.getServerURL() + "users/edit"
    let user = this.configService.getUser();
    let body: any = {user_id: user_id, token: user.token};
    if (name != undefined)body["name"] = name;
    if (email != undefined)body["email"] = email;
    if (role != undefined)body["role"] = role;
    if (password != undefined)body["password"] = password;
    if (project_list != undefined)body["project_list"] = project_list;
    let bodyStr = JSON.stringify(body);
   
    //return this.http.post(editUserUrl, bodyStr);
    return sendRequest(editUserUrl, bodyStr, null, null);
  }
  
  editUserPipe(name: string, password: string, email: string, role: string, project_list: any, user_id : string) {
    let editUserUrl = this.configService.getServerURL() + "users/edit"
    let user = this.configService.getUser();
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
    let editUserUrl = this.configService.getServerURL() + "users/info"
    let user = this.configService.getUser();
    let body = '';
    if (user_id != ""){
      body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    }else{
      body = '{"token":"'+user.token+'"}';
    }
    return this.http.post(editUserUrl, body);
  }
  getProjectInfo(project_id: string) {
    let editProjectUrl = this.configService.getServerURL() + "projects/info"
    let body = '{"project_id":"'+project_id+'"}';
    return this.http.post(editProjectUrl, body);
  }

  deleteUser(user_id: string) {
    console.log("delete user"+user_id);
    let user = this.configService.getUser();
    let body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    sendRequest(this.configService.getServerURL() + "users/remove", body, null, null);
    
  }


  uploadCharacter(name: string, skeleton_type: string, data: ArrayBuffer, callback? : any){
    //https://gist.github.com/nuclearglow/ab251744db0ebddd504eea28153eb279    
    let user = this.configService.getUser();
    let body = {user:user.username, token: user.token, name:name, skeleton_type: skeleton_type, data: Array.from(new Uint8Array(data))};
    let bodyStr = JSON.stringify(body);
    sendRequest(this.configService.getServerURL() + "upload_character_model", bodyStr, callback, null);
  }

  
  getCharacterModels(skeleton_type: string){
    let user = this.configService.getUser();
    let body = {user:user.username, token: user.token, skeleton_type: skeleton_type};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.configService.getServerURL() + "get_character_model_list", bodyStr);
   }

   deleteCharacter(skeleton_type: string, character_name: string, callback? : any) {
    console.log("delete character"+character_name);
    let user = this.configService.getUser();
    let body = {token: user.token, name:character_name, skeleton_type: skeleton_type};
    let bodyStr = JSON.stringify(body);
    sendRequest(this.configService.getServerURL() + "delete_character_model", bodyStr, callback, null);
    
  }

  getUserProjectList(user_id : string){
    let user = this.configService.getUser();
    let body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    return this.http.post(this.configService.getServerURL() + "user/projects", body);
  }

  getExperimentList(collection_id: string){
    let user = this.configService.getUser();
    let body = {token: user.token, collection: collection_id};
    let bodyStr = JSON.stringify(body);
    return this.http.post(this.configService.getServerURL() + "experiments", bodyStr);
  }
  deleteExperiment(exp_id: string) {
   let user = this.configService.getUser();
   let body = {token: user.token, experiment_id: exp_id};
   let bodyStr = JSON.stringify(body);
   sendRequest(this.configService.getServerURL() + "experiments/remove", bodyStr, null, null);
   
 }  
 
 getExperimentLog(exp_id: string){
  let user = this.configService.getUser();
  let body = {token: user.token, experiment_id: exp_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "experiments/log", bodyStr);
} 
getExperimentInfo(exp_id: string){
  let user = this.configService.getUser();
  let body = {token: user.token, experiment_id: exp_id};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "experiments/info", bodyStr);
}

downloadModel(modelID: string, name: string){
  if (!name.endsWith(".zip")){
     name = name+".zip";
  }
  let user = this.configService.getUser();
  let body = {token: user.token, model_id: modelID};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "models/download", bodyStr,  {observe: 'response', responseType: 'blob'}).subscribe((res: any)=>{
    saveAs(res.body, name);
  });

}
createDataType(name: string, requirements: string){
  console.log("send post request");
  let user = this.configService.getUser();
  let body = {token: user.token, name: name, requirements: requirements};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_types/add", bodyStr);
}

editDataType(data_type:string, newName: string, requirements: string) {
  let user = this.configService.getUser();
  let body: any = {token: user.token, data_type: data_type};
  body["name"] = newName;
  body["requirements"] = requirements;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return this.http.post<any>(this.configService.getServerURL() + "data_types/edit", bodyStr);
}

getDataTypeList(){
  let user = this.configService.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_types", bodyStr);
}
deleteDataType(data_type: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_types/remove", bodyStr);
  
}  
getDataTypeInfo(data_type: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_types/info", bodyStr);
}  


getTagList(){
  let user = this.configService.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "tags", bodyStr);
}

addDataTag(tag :string){
  let user = this.configService.getUser();
  let body = {token: user.token, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "tags/add", bodyStr);
}

renameDataTag(oldTag:string, newTag :string){
  let user = this.configService.getUser();
  let body = {token: user.token, old_tag: oldTag, new_tag: newTag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "tags/rename", bodyStr);
}

removeDataTag(tag :string){
  let user = this.configService.getUser();
  let body = {token: user.token, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "tags/remove", bodyStr);
}

getDataTypeTagList(data_type: string){
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_types/tags", bodyStr);
}

addDataTypeTag(data_type: string, tag :string){
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type, tag: tag};
  let bodyStr = JSON.stringify(body);
  
  // sendRequest(this.config.getServerURL() + "data_types/tags/add", bodyStr, null, null);
 return this.http.post(this.configService.getServerURL() + "data_types/tags/add", bodyStr);
}

removeDataTypeTag(data_type: string, tag :string){
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type, tag: tag};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_types/tags/remove", bodyStr);
}

removeAllDataTypeTags(data_type: string){
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_types/tags/removeall", bodyStr);

}

createDataLoader(dataType: string, engine: string, script: string, requirements: string){
  console.log("send post request");
  let user = this.configService.getUser();
  let body = {token: user.token,engine:engine, dataType: dataType, script:script, requirements: requirements};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_loaders/add", bodyStr);
}

editDataLoader(dataType: string, engine: string, script: string, requirements: string) {
  let user = this.configService.getUser();
  let body: any = {token: user.token, data_type: dataType, engine:engine};
  body["script"] = script;
  body["requirements"] = requirements;
  let bodyStr = JSON.stringify(body);
 
  //return this.http.post(editUserUrl, bodyStr);
  return sendRequest(this.configService.getServerURL() + "data_loaders/edit", bodyStr, null, null);
}

getDataLoaderList(){
  let user = this.configService.getUser();
  let body = {token: user.token};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_loaders", bodyStr);
}
deleteDataLoader(data_type: string, engine: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type, engine:engine};
  let bodyStr = JSON.stringify(body);
  return this.http.post(this.configService.getServerURL() + "data_loaders/remove", bodyStr);

}  
getDataLoaderInfo(data_type: string, engine: string) {
  let user = this.configService.getUser();
  let body = {token: user.token, data_type: data_type, engine:engine};
  let bodyStr = JSON.stringify(body);
  return this.http.post<any>(this.configService.getServerURL() + "data_loaders/info", bodyStr);
}  
}
