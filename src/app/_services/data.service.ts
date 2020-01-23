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
    user.username = data.username;
    user.token = data.token;
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

  getCollectionsBAK(parentID:string="0",owner?: number): Observable<CollectionNode[]> {
    if(owner == undefined){
      owner = 0;
    }
    let ownerStr = String(owner);
    return this.queryCollectionList(parentID, owner).pipe(
      map((data:any[]) => data.map((dataItem:any) => {
        const node: CollectionNode = new CollectionNode(dataItem[0], dataItem[1]);
        return node;
      })),
      flatMap((collections:CollectionNode[]) => {
        if(collections.length > 0){
          return forkJoin(
            collections.map((collection:CollectionNode) => {
				
              return this.queryCollectionList(collection.id, owner).pipe(
                map((res:any) => {
                  let primitives = res;
                  collection.children = primitives;
                  return collection;
                })
              );
            })
          );
        }
        return of([]);
      })
    );
  }
  
  queryCollectionList(parentID: string, owner: number){
	let ownerStr = String(owner);
	let parentIDStr = String(parentID);
	return this.http.post<CollectionNode[]>(this.getServerURL() + "get_collection_list", '{"parent_id": "'+parentIDStr+'", "owner":'+ownerStr+'}');
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
}
