import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '@app/_services/data.service';
import { UserService } from '@app/_services/user.service';
import { FileSaverService } from '@app/_services/file-saver.service';
import { MessageService } from '../_services/message.service';
import { HttpHeaders } from '@angular/common/http';
import { CollectionNode } from '../_models/collections';
import { Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreeComponent, TreeModel, TreeNode } from 'angular-tree-component';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less'],
  host: {'class': 'padded-col fill-col', 'id': 'sidebar'}
})
export class SidebarComponent implements OnInit {
  private enable_download = false;

  public skeleton_list: any;
  public collections: any[] = [];
  
  
  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public options = {
	
  };

  public motion_list: any;
  public motion_info: any;
  public model_list: any;
  public graph_list: any;
  

  public fileList: FileList;

  private collectionOpen = false;

  private activeTab: string = "tab1";
  private activeModal: string = "none";

  private currentAction: string;
  private currentSkeleton: string;
  private currentCollection: string;

  private currentActionName: string;
  private currentCollectionName: string;

  private queuedClip: any;
    setQueuedClip(newClip: any){
      this.queuedClip = newClip;
    }

  error = '';

  collectionSubmitted = false;
  motionSubmitted = false;
  primitiveSubmitted = false;

  newCollectionForm: FormGroup;
  motionUploadForm: FormGroup;
  primitiveUploadForm: FormGroup;

  constructor(private dataService: DataService,
              private msgService: MessageService,
              private fileService: FileSaverService,
              private formBuilder: FormBuilder,
              private user: UserService) {
              }

  ngOnInit() {
    this.currentSkeleton = "custom";
    this.getDownloadSettings();
    this.getSkeletonModels();
    this.getCollectionList();
    this.getModelList();
    this.getGraphList();
    this.initForms();
    

  }
  ngAfterInit() {
    const treeModel:TreeModel = this.treeComponent.treeModel;
    const firstNode:TreeNode = treeModel.getFirstRoot();
    
    firstNode.setActiveAndVisible();
  }
  initForms(){
    this.newCollectionForm = this.formBuilder.group({
        newCollectionName: ['', Validators.required],
        newCollectionType: ['', Validators.required]
    });

    this.motionUploadForm = this.formBuilder.group({
        motionFiles: ['', Validators.required],
        skeletonTarget: ['', Validators.required]
    });

    this.primitiveUploadForm = this.formBuilder.group({
        primitiveFiles: ['', Validators.required]
    });

  }

  getDownloadSettings(){
    this.dataService.getMetaInformation().subscribe(
      metaData => this.enable_download = metaData['enable_download']
    );
  }

  getCollectionList(){
	//this.tree = document.getElementById("collectionTree");
	let parentNode = null;
    this.queryCollectionTree(0,parentNode,0);
  }
   onSelectNode(event){
	   console.log("select node", event.node.data);
	   this.selectCollection(event.node.data.id, event.node.data.name);
   }
   
   queryCollectionTree(parentID: number=0, parentNode:any, owner: number, depth: number=0){

	 if(owner == undefined){
      owner = 0;
    }
   
    let ownerStr = String(owner);
	let parentIDStr = String(parentID);
	this.dataService.queryCollectionList(parentIDStr, owner).subscribe( 
			values => {
			let temp = [];
			for(let i in values){
				//console.log(i, values[i]);
				let node = {"id":values[i][0], "name": values[i][1]};
				node["children"] = [];
				//let node = new CollectionNode(values[i][0], values[i][1]);
				//node.children = [];
				temp.push(node);
				this.queryCollectionTree(values[i][0],node,0);
			}
			if (parentNode == null){
				this.collections = temp;
			}else{
				parentNode["children"] = temp;
				//parentNode.children = temp;
			}
			this.treeComponent.treeModel.update();
		}
	);
	
		
  }

  getSkeletonModels(){
    this.dataService.getSkeletonModels().subscribe(
        skeletons => this.skeleton_list = skeletons
      );
  }

  getMotionList(){
    this.dataService.getMotionList(this.currentSkeleton, this.currentCollection).subscribe(
        motionList => {this.motion_list = motionList; this.getMotionInfo();}
      );
  }
  getMotionInfo(){
    this.dataService.getMotionInfo(this.motion_list).subscribe(
      motionInfo => {this.motion_info = motionInfo}
    );
  }

  getModelList(){
    this.dataService.getModelList(this.currentSkeleton, this.currentCollection).subscribe(
        modelList => this.model_list = modelList
      );
  }

  getGraphList(){
    this.dataService.getGraphList(this.currentSkeleton).subscribe(
        graphList => this.graph_list = graphList
      );
  }

  callModal(modalName: string){
      this.activeModal = modalName;
  }

  selectSkeleton(event){
    console.log("Selected Skeleton: " + event);
    this.msgService.sendMessage("AnimationGUI", "SetSourceSkeleton", this.currentSkeleton);
    this.getMotionList();
    this.getModelList();
    this.getGraphList();
  }

  selectAction(id, name){
    if(this.parentIsOpen(id))
      this.collectionOpen = false;
    else
      this.collectionOpen = true;

    this.currentAction = id;
    this.currentActionName = name;
    console.log("Selected Action: " + id);
  }

  selectCollection(id, name){
    this.currentCollection = id;
    this.currentCollectionName = name;
    console.log("Selected Motion Primitive: " + id);
    this.getMotionList();
    this.getModelList();
  }

  resetSelection(){
    this.currentCollection = null;
    this.currentAction = null;
    this.currentActionName = null;
    this.currentCollectionName = null;
    this.motion_list = [];
    this.model_list = [];
    this.graph_list = [];
  }

  parentIsOpen(id){
    return this.currentAction == id && this.collectionOpen;
  }

  motionsFound(){
    return this.motion_list && this.motion_list.length > 0;
  }

  openCollectionForm(){
    this.callModal("newCollection");
  }

  removeCollection(){
    console.log("Click event fired: remove action");
    this.callModal("removeCollection");
  }

  deleteClip(name: string, id: number){
    this.queuedClip = {id: id, name: name};
    this.callModal("deleteClip");
  }

  downloadClip(clipID: string, name: string){
    this.dataService.downloadClipAsBVH(clipID, name);
  }

  downloadSample(modelID: string, name: string){
    this.dataService.downloadSampleAsBVH(modelID, name);
  }

  saveToFile(responseText: string, motionName: string){
    // TODO: Fill
    // create new Blob and call file service
  }

  createCollection(modal: any){
    this.collectionSubmitted = true;

    // stop here if form is invalid
    if (this.newCollectionForm.invalid) {
        return;
    }
    modal.closeModal();
    let collectionID = "0";
    if (this.currentCollection != undefined)
      collectionID = this.currentCollection;
    this.dataService.createCollection(collectionID,
                                  this.newCollectionForm.controls.newCollectionName.value,
                                  this.newCollectionForm.controls.newCollectionType.value
                                  ).subscribe(
        data => { },
        error => {
            this.error = error;
            console.log("ERROR: " + error);
        });
  }

 handleFileInput(files: FileList) {
    //https://stackoverflow.com/questions/47936183/angular-file-upload
      this.fileList = files;
  
  }

  uploadMotionClip(modal: any){
    //https://stackoverflow.com/questions/27254735/filereader-onload-with-result-and-parameter
    //https://developer.mozilla.org/de/docs/Web/API/FileReader/onload
    //https://www.html5rocks.com/de/tutorials/file/dndfiles/
    //https://stackoverflow.com/questions/47936183/angular-file-upload
    this.motionSubmitted = true;

    // stop here if form is invalid
    if (this.motionUploadForm.invalid) {
        return;
    }
    let skeletonName = this.motionUploadForm.controls.skeletonTarget.value;
    let collectionID = this.currentCollection;
    let dataService = this.dataService;
    let callback =  (e) => {this.getMotionList();};
    let inputField = document.getElementById("uploadMotionFilesBtn");
    for (var i = 0; i < this.fileList.length; i++) {
		    let f = this.fileList.item(i);
        let reader = new FileReader();
        reader.onloadend = (e) => {
          let name = f.name;
          let bvhStr = <string> reader.result;
          if (bvhStr != undefined){ 
            bvhStr = bvhStr.replace(/(\r\n|\n|\r)/gm,"\\n");
            bvhStr = bvhStr.replace(/\t/gm,"     ");
            dataService.uploadBVHClip(collectionID, skeletonName, name, bvhStr, callback);
           }
       };

        // Read in the bvh file as a text
        reader.readAsText(f);
	}
	
    modal.closeModal();
  }

  uploadMotionPrimitive(modal: any){
    this.primitiveSubmitted = true;

    // stop here if form is invalid
    if (this.primitiveUploadForm.invalid) {
        return;
    }

    modal.closeModal();
    //TODO: uploadFiles
  }

  showStateGraphScene(id: number){
    // TODO: handle state graph
    return;
  }

  messageUnityInstance(gameObject: string, functionName: string, paramValue: any){
    this.msgService.sendMessage(gameObject, functionName, String(paramValue));
  }

  callMotionClips(){
    this.activeTab ='tab1';
    this.messageUnityInstance("WebGLHub", "LoadNewScene" ,"rest_interface_client");
  }

  callMotionModel(){
    this.activeTab ='tab2';
    this.messageUnityInstance("WebGLHub", "LoadNewScene" ,"rest_interface_client");
  }

  callMotionState(){
    this.activeTab ='tab3';
    this.messageUnityInstance("WebGLHub", "LoadNewScene" ,"test");
  }
}
