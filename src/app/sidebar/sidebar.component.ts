import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '@app/_services/data.service';
import { UserService } from '@app/_services/user.service';
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

  public skeletonList: any;
  public collections: any[] = [];
  
  
  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public options = {
	
  };

  public motionList: any;
  public motionInfo: any;
  public modelList: any;
  public graphList: any;
  public characterList: any;
  

  public motionFileList: FileList;
  public skeletonFileList: FileList;
  public characterFileList: FileList;

  private collectionOpen = false;

  private activeTab: string = "tab1";
  private activeModal: string = "none";

  private currentSkeleton: string;
  private selectedSkeleton: string;
  private selectedCharacter: string;
  private currentCollection: string;

  private currentCollectionName: string;

  private queuedClip: any;
    setQueuedClip(newClip: any){
      this.queuedClip = newClip;
    }

  error = '';

  skeletonSubmitted = false;
  collectionSubmitted = false;
  motionSubmitted = false;
  primitiveSubmitted = false;
  
  addSkeletonForm: FormGroup;
  editSkeletonForm: FormGroup;
  newCollectionForm: FormGroup;
  motionUploadForm: FormGroup;
  primitiveUploadForm: FormGroup;

  constructor(private dataService: DataService,
              private msgService: MessageService,
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
    this.getCharacterModels(this.currentSkeleton);
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
    this.addSkeletonForm = this.formBuilder.group({
      skeletonName: ['', Validators.required],
      skeletonFile: ['', Validators.required]
  });
  this.editSkeletonForm = this.formBuilder.group({
    characterFile: ['', Validators.required]
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
    this.queryCollectionTree(0, parentNode);
  }

   onSelectNode(event){
	   console.log("select node", event.node.data);
	   this.selectCollection(event.node.data.id, event.node.data.name);
   }
   
   queryCollectionTree(parentID: number=0, parentNode:any, depth: number=0){


    let parentIDStr = String(parentID);
    this.dataService.queryCollectionList(parentIDStr).subscribe(
        values => {
        let temp = [];
        for(let i in values){
          //console.log(i, values[i]);
          let node = {"id":values[i][0], "name": values[i][1]};
          node["children"] = [];
          //let node = new CollectionNode(values[i][0], values[i][1]);
          //node.children = [];
          temp.push(node);
          this.queryCollectionTree(values[i][0], node);
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
        skeletons => this.skeletonList = skeletons
      );
  }

  getMotionList(){
    this.dataService.getMotionList(this.currentSkeleton, this.currentCollection).subscribe(
        motionList => {this.motionList = motionList; this.getMotionInfo();}
      );
  }
  getMotionInfo(){
    this.dataService.getMotionInfo(this.motionList).subscribe(
      motionInfo => {this.motionInfo = motionInfo}
    );
  }

  getModelList(){
    this.dataService.getModelList(this.currentSkeleton, this.currentCollection).subscribe(
        modelList => this.modelList = modelList
      );
  }

  getGraphList(){
    this.dataService.getGraphList(this.currentSkeleton).subscribe(
        graphList => this.graphList = graphList
      );
  }

  getCharacterModels(skeletonName: string){
    this.dataService.getCharacterModels(skeletonName).subscribe(
        
      characters => {
        this.characterList = characters;
        }
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



  selectCollection(id, name){
    this.currentCollection = id;
    this.currentCollectionName = name;
    console.log("Selected Collection: " + id);
    this.getMotionList();
    this.getModelList();
  }

  resetSelection(){
    this.currentCollection = null;
    this.currentCollectionName = null;
    this.motionList = [];
    this.modelList = [];
    this.graphList = [];
  }

  motionsFound(){
    return this.motionList && this.motionList.length > 0;
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
        data => { this.getCollectionList(); },
        error => {
            this.error = error;
            console.log("ERROR: " + error);
        });
  }

 handleMotionFileInput(files: FileList) {
    //https://stackoverflow.com/questions/47936183/angular-file-upload
      this.motionFileList = files;
  
  }
  handleSkeletonFileInput(files: FileList) {
      this.skeletonFileList = files;
  }  
  
  handleCharacterFile(files: FileList) {
      this.characterFileList = files;
  }  
  
  addSkeleton(modal: any){
    this.skeletonSubmitted = true;

    console.log("add skeleton");

    // stop here if form is invalid
    if (this.addSkeletonForm.invalid) {
      return;
  }
  
  let updateCallback = (e) => {this.getSkeletonModels();};
  let skeletonName = this.addSkeletonForm.controls.skeletonName.value;
  console.log("add skeleton", skeletonName);
  let backendCall = (name: string, bvhStr: string) => {
      bvhStr = bvhStr.replace(/(\r\n|\n|\r)/gm,"\\n");
      bvhStr = bvhStr.replace(/\t/gm,"     ");
      this.dataService.uploadSkeleton(skeletonName, bvhStr, updateCallback);
    };

    for (var i = 0; i < this.skeletonFileList.length; i++) {
        let f = this.skeletonFileList.item(i);
        this.uploadTextFile(f, backendCall);
        break;
    }

    modal.closeModal();
  }
  

  openEditSkeletonForm(){
    this.getCharacterModels(this.currentSkeleton);
    this.callModal('editSkeleton');
  }

  deleteSkeleton(){
    this.selectedSkeleton = this.currentSkeleton.valueOf();
    this.callModal("deleteSkeleton");
  }

  uploadTextFile(f: any, callback: any){
    //https://developer.mozilla.org/de/docs/Web/API/FileReader/onload
    //https://stackoverflow.com/questions/27254735/filereader-onload-with-result-and-parameter
    //https://www.html5rocks.com/de/tutorials/file/dndfiles/
    //https://stackoverflow.com/questions/47936183/angular-file-upload
    let reader = new FileReader();
    reader.onloadend = (e) => {
        let name = f.name;
        let resulStr = <string> reader.result;
        if (resulStr != undefined){ 
          callback(f.name, resulStr);
        }
      }
      // Read in the file as a text
      reader.readAsText(f);
  }

  uploadBinaryFile(f: any, callback: any){
    //https://developer.mozilla.org/en-US/docs/Web/API/File/getAsBinary
    let reader = new FileReader();
    reader.onloadend = (e) => {
        let name = f.name;
        let resultBuffer = <ArrayBuffer> reader.result;
        console.log("result");
        console.log(resultBuffer);
        if (resultBuffer != undefined){ 
          callback(f.name, resultBuffer);
        }
      }
      // Read in the file as binary
      reader.readAsArrayBuffer(f);
  }


  uploadMotionClip(modal: any){
    this.motionSubmitted = true;

    // stop here if form is invalid
    if (this.motionUploadForm.invalid) {
        return;
    }

    let skeletonName = this.motionUploadForm.controls.skeletonTarget.value;
    let collectionID = this.currentCollection;
    let dataService = this.dataService;
    let updateCallback =  (e) => {this.getMotionList();};
    let inputField = document.getElementById("uploadMotionFilesBtn");

    let backendCall = (name: string, bvhStr: string) => {
      bvhStr = bvhStr.replace(/(\r\n|\n|\r)/gm,"\\n");
      bvhStr = bvhStr.replace(/\t/gm,"     ");
      dataService.uploadBVHClip(collectionID, skeletonName, name, bvhStr, updateCallback);
    };

    for (var i = 0; i < this.motionFileList.length; i++) {
        let f = this.motionFileList.item(i);
        this.uploadTextFile(f, backendCall);
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
  }

  uploadCharacter(){
    // stop here if form is invalid
    if (this.editSkeletonForm.invalid) {
        return;
    }

    let skeletonName = this.currentSkeleton;
    let updateCallback =  (e) => {this.getCharacterModels(skeletonName);};
    let backendCall = (name: string, dataStr: any) => {
      this.dataService.uploadCharacter(name, skeletonName, dataStr, updateCallback);
    };
    for (var i = 0; i < this.characterFileList.length; i++) {
      let f = this.characterFileList.item(i);
      this.uploadBinaryFile(f, backendCall);
    }
  }

  deleteCharacter(characterName: string){
    let updateCallback =  (e) => {this.getCharacterModels(this.currentSkeleton);};
    this.dataService.deleteCharacter(this.currentSkeleton, characterName, updateCallback);
  }

  showStateGraphScene(id: number){
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
