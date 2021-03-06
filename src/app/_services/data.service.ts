import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap, map, flatMap } from 'rxjs/operators';

import { CollectionNode } from '../_models/collections'
//import  { saveAs } from '@assets/FileSaver.js';
import { saveAs } from 'file-saver/src/FileSaver';
import { User } from '@app/_models/user';

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
    let data =  JSON.parse(localStorage.getItem('currentUser'));
    let user = new User();
    user.username = "";
    user.token = "";
    if (data != null){
      user.username = data.username;
      user.token = data.token;
    }
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
    let columnList = ["ID", "numFrames", "public"];
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
    let c = undefined
    sendRequest(this.getServerURL() + "remove_collection", JSON.stringify(body), c, null);
    //return this.http.post(this.getServerURL() + "remove_collection", JSON.stringify(body));
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

  uploadSkeleton(skeletonName: string, input_data: string, callback: any){
    let user = this.getUser();
    let body =  {name:skeletonName, data: input_data, user:user.username, token: user.token, data_type: "bvh"}
    sendRequest(this.getServerURL() + "create_new_skeleton", JSON.stringify(body), callback, null);
  }

  deleteSkeleton(skeletonName: string, callback: any){
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
 
  createGroup(name: string){
    console.log("send post request");
    let user = this.getUser();
    let body = '{"group_name":"'+name+'", "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "groups/add", body, null, null);
  }
  
  editGroup(group_id: string, name: string, users: any){
    console.log("send post request");
    let user = this.getUser();
    let body = '{"group_id":"'+group_id+'", "group_name":"'+name+'", "users":'+JSON.stringify(users) +', "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "groups/edit", body, null, null);
  }
  
  getServerList(){
    return this.http.get(this.getServerURL() + "servers");
  }
  
  getGroupList(){
    return this.http.get(this.getServerURL() + "groups");
  }
  
  getUserList(){
    return this.http.get(this.getServerURL() + "users");
  }

  getGroupMemberList(group_id : string){
    let body = '{"group_id":"'+group_id+'"}';
    return this.http.post(this.getServerURL() + "group_members", body);
  }
  
  getUserAccessGroupList(user_id : string){
    let body = '{"user_id":"'+user_id+'"}';
    return this.http.post(this.getServerURL() + "user_access_groups", body);
  }

  deleteGroup(group_id: string){
    let user = this.getUser();
    let body = '{"group_id":"'+group_id+'", "token":"'+user.token+'"}';
    sendRequest(this.getServerURL() + "groups/remove", body, null, null);
  }

    
  createUser(name: string, email: string, password: string) {
      let createUserUrl = this.getServerURL() + "users/add"
      let role = "user";
      return this.http.post<any>(createUserUrl, { name, password, role, email });
  }

  editUser(name: string, password: string, email: string, role: string, shared_access_groups: any, user_id : string) {
    let editUserUrl = this.getServerURL() + "users/edit"
    let user = this.getUser();
    let body = {token: user.token};
    if (name != null)body["name"] = name;
    if (email != null)body["email"] = email;
    if (role != null)body["role"] = role;
    if (password != null)body["password"] = password;
    if (shared_access_groups != null)body["shared_access_groups"] = JSON.stringify(shared_access_groups);
    if (user_id  != null)body["user_id"] = user_id ;
    let bodyStr = JSON.stringify(body);
    //let bodyStr = '{"name":"'+name+'","password":"'+password+'",  "email":"'+email+'",  "role":"'+role+'", "shared_access_groups":'+JSON.stringify(shared_access_groups) +', "token":"'+user.token+'"}';
    //return this.http.post(editUserUrl, bodyStr);
    return sendRequest(editUserUrl, bodyStr, null, null);
  }
  
  editUserPipe(name: string, password: string, email: string, role: string, shared_access_groups: any, user_id : string) {
    let editUserUrl = this.getServerURL() + "users/edit"
    let user = this.getUser();
    let body = {token: user.token};
    if (name != null)body["name"] = name;
    if (email != null)body["email"] = email;
    if (role != null)body["role"] = role;
    if (password != null)body["password"] = password;
    if (shared_access_groups != null)body["shared_access_groups"] = JSON.stringify(shared_access_groups);
    if (user_id  != null)body["user_id"] = user_id ;
    let bodyStr = JSON.stringify(body);
    //let bodyStr = '{"name":"'+name+'","password":"'+password+'",  "email":"'+email+'",  "role":"'+role+'", "shared_access_groups":'+JSON.stringify(shared_access_groups) +', "token":"'+user.token+'"}';
    return this.http.post(editUserUrl, bodyStr);
  }

  getUserInfo(user_id: string) {
    let editUserUrl = this.getServerURL() + "users/info"
    let user = this.getUser();
    let body = '';
    if (user_id != null){
      body = '{"user_id":"'+user_id+'", "token":"'+user.token+'"}';
    }else{
      body = '{"token":"'+user.token+'"}';
    }
    return this.http.post(editUserUrl, body);
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
}
