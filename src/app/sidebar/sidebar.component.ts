import { Component, OnInit,ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { MessageService } from '../_services/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TreeModule, TreeComponent } from '@circlon/angular-tree-component';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less'],
  host: {'class': 'padded-col fill-col', 'id': 'sidebar'}
})
export class SidebarComponent implements OnInit {
  public enable_download = false;

  public projectList: any;
  public projectInfo: any;
  public skeletonList: any;
  public collections: any[] = [];
  
  
  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public options = {
	
  };

  public fileList: any;
  public motionInfo: any;
  public tagList: any;
  public dataTypeList: any;
  public experimentList: any;
  public graphList: any;
  public characterList: any;
  

  public uploadedBVHFileList: FileList;
  public skeletonFileList: FileList;
  public binaryFileList: FileList;
  public characterFileList: FileList;

  public activeTab: string = "tab1";
  public activeModal: string = "none";
  public currentProject: number = 1;
  public currentSkeleton: string = "";
  public currentTag: string = "";
  public selectedTagForModal: string = "";
  public selectedSkeleton: string = "";
  public selectedCharacter: string = "";
  public currentCollection: string = "";

  public currentCollectionName: string = "";

  public queuedClip: any;
    setQueuedClip(newClip: any){
      this.queuedClip = newClip;
    }

  error = '';

  skeletonSubmitted = false;
  collectionSubmitted = false;
  bvhSubmitted = false;
  uploadFileSubmitted = false;
  
  addSkeletonForm: FormGroup;
  editSkeletonForm: FormGroup;
  newCollectionForm: FormGroup;
  bvhFileUploadForm: FormGroup;
  uploadFileForm: FormGroup;
  editTagForm: FormGroup;

  constructor(public dataService: DataService,
              public msgService: MessageService,
              public formBuilder: FormBuilder,
              public user: UserService) {
              }

  ngOnInit() {
    this.currentSkeleton = "custom";
    this.currentTag = "clip";
    
    this.currentProject = 1;
    this.getDownloadSettings();
    this.getProjects();
    this.getTagList();
    this.getSkeletonModels();
    this.initProject();
    this.getGraphList();
    this.getCharacterModels(this.currentSkeleton);
    this.initForms();

  }

  ngAfterInit() {
    let firstNode = this.treeComponent.treeModel.getFirstRoot();
    
    firstNode.setActiveAndVisible();
  }
  initForms(){
   
    this.newCollectionForm = this.formBuilder.group({
      newCollectionName: ['', Validators.required],
      newCollectionType: ['', Validators.required]
  });

  this.bvhFileUploadForm = this.formBuilder.group({
      bvhFiles: ['', Validators.required],
      skeletonTarget: ['', Validators.required],
      dataType: ['', Validators.required]
  });

  this.uploadFileForm = this.formBuilder.group({
      files: ['', Validators.required],
      skeletonTarget: ['', Validators.required],
      dataType: ['', Validators.required]
  });
  this.addSkeletonForm = this.formBuilder.group({
    skeletonName: ['', Validators.required],
    skeletonFile: ['', Validators.required]
});
this.editSkeletonForm = this.formBuilder.group({
  characterFile: ['', Validators.required]
});
this.editTagForm =  this.formBuilder.group({
  name: ['', Validators.required]
});

  }

  getDownloadSettings(){
    this.dataService.getMetaInformation().subscribe(
      (metaData:any) => {
        this.enable_download = metaData['enable_download']
      }
    );
  }

  getProjects(){
    this.dataService.getProjectList().subscribe(
      (projectList: any) => {
        this.projectList = projectList;
        }
      );
  }

  initProject(){
    let projectID = this.currentProject.toString();
    this.dataService.getProjectInfo(projectID).subscribe(
      (projectInfo:any) => {
        this.projectInfo = projectInfo;
        this.currentCollection = this.projectInfo["collection"];
      this.getCollections();
      this.getFileList();
      this.getDataTypeList();
      this.getExperimentList();
      this.getGraphList();
    }
    );
  }

  getCollections(){
	  //this.tree = document.getElementById("collectionTree");
    let parentID = this.projectInfo["collection"];
    let parentNode = null;
    this.queryCollectionTree(parentID, parentNode);
  }

   onSelectNode(event: any){
	   console.log("select node", event.node.data);
	   this.selectCollection(event.node.data.id, event.node.data.name);
   }
   
   queryCollectionTree(parentID: number=0, parentNode:any, depth: number=0){


    let parentIDStr = String(parentID);
    this.dataService.queryCollectionList(parentIDStr).subscribe(
        (values :any) => {
        let temp = [];
        for(let i in values){
          //console.log(i, values[i]);
          let node = {"id":values[i][0], "name": values[i][1], "children":[]};
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
      (skeletons :any)  => this.skeletonList = skeletons
      );
  }

  getFileList(){
    let tagFilterList = [this.currentTag];
    this.dataService.getFileList(this.currentSkeleton, this.currentCollection, tagFilterList).subscribe(
      (fileList :any) => {this.fileList = fileList; }
      );
  }
  getMotionInfo(){
    this.dataService.getMotionInfo(this.fileList).subscribe(
      (motionInfo :any)  => {this.motionInfo = motionInfo}
    );
  }
  getExperimentList(){
    this.dataService.getExperimentList(this.currentCollection).subscribe(
      (experimentList :any) => {this.experimentList = experimentList}
      );
  }
  getTagList(){
    this.dataService.getTagList().subscribe(
      (tagList :any) => {this.tagList = tagList; }
      );
  }

  getDataTypeList(){
    this.dataService.getDataTypeList().subscribe(
      (dataTypeList :any) => {this.dataTypeList = dataTypeList; }
      );
  }
  getGraphList(){
    this.dataService.getGraphList(this.currentSkeleton).subscribe(
      (graphList :any)  => this.graphList = graphList
      );
  }

  getCharacterModels(skeletonName: string){
    this.dataService.getCharacterModels(skeletonName).subscribe(
        
      (characters :any) => {
        this.characterList = characters;
        }
      );
  }

  callModal(modalName: string){
      this.activeModal = modalName;
  }

  selectSkeleton(event: any){
    console.log("Selected Skeleton: " + event);
    this.msgService.sendMessage("AnimationGUI", "SetSourceSkeleton", this.currentSkeleton);
    this.getFileList();
    this.getGraphList();
  }

  selectTag(event: any){
    console.log("Selected Tag: " + event);
    this.getFileList();
    this.getExperimentList();
  }

  selectProject(event: any){
    console.log("Selected project: " + event);
    this.initProject();

  }

  selectCollection(id: string, name: string){
    this.currentCollection = id;
    this.currentCollectionName = name;
    console.log("Selected Collection: " + id);
    this.getFileList();
    this.getExperimentList();
  }

  resetSelection(){
    this.currentCollection = "";
    this.currentCollectionName = "";
    this.fileList = [];
    this.experimentList = [];
    this.graphList = [];
  }

  motionsFound(){
    return this.fileList && this.fileList.length > 0;
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
                                  this.newCollectionForm.controls["newCollectionName"].value,
                                  this.newCollectionForm.controls["newCollectionType"].value
                                  ).subscribe(
        (data :any)=> { this.getCollections(); },
        (error: any) => {
            this.error = error;
            console.log("ERROR: " + error);
        });
  }

 handleBVHFileInput(target: any) {
    //https://stackoverflow.com/questions/47936183/angular-file-upload
    if (target == null) return;
    this.uploadedBVHFileList = target.files;
  
  }
  handleSkeletonFileInput(target: any) {
    if (target == null) return;
    this.skeletonFileList = target.files;
  }  
  
  handleCharacterFile(target: any) {
    if (target == null) return;
    this.characterFileList = target.files;
  }  
  
  handleBinaryFile(target: any) {
    if (target == null) return;
    this.binaryFileList = target.files;
  }  
  addSkeleton(modal: any){
    this.skeletonSubmitted = true;

    console.log("add skeleton");

    // stop here if form is invalid
    if (this.addSkeletonForm.invalid) {
      return;
  }
  
  let updateCallback = (e: any) => {this.getSkeletonModels();};
  let skeletonName = this.addSkeletonForm.controls["skeletonName"].value;
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


  openEditTagForm(){
    this.editTagForm.controls["name"].setValue(this.selectedTagForModal);
    this.callModal('editTag');
  }

  deleteTag(){
    this.callModal("deleteTag");
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


  importBVHFile(modal: any){
    this.bvhSubmitted = true;

    // stop here if form is invalid
    if (this.bvhFileUploadForm.invalid) {
        return;
    }

    let skeletonName = this.bvhFileUploadForm.controls["skeletonTarget"].value;
    let collectionID = this.currentCollection;
    let dataService = this.dataService;
    let updateCallback =  (e: any) => {this.getFileList();};
    let inputField = document.getElementById("importBVHFilesBtn");

    let backendCall = (name: string, bvhStr: string) => {
      bvhStr = bvhStr.replace(/(\r\n|\n|\r)/gm,"\\n");
      bvhStr = bvhStr.replace(/\t/gm,"     ");
      dataService.uploadBVHClip(collectionID, skeletonName, name, bvhStr, updateCallback);
    };

    for (var i = 0; i < this.uploadedBVHFileList.length; i++) {
        let f = this.uploadedBVHFileList.item(i);
        this.uploadTextFile(f, backendCall);
    }

    modal.closeModal();
  }


  
  uploadFile(modal: any){
    this.uploadFileSubmitted = true;
    // stop here if form is invalid
    if (this.uploadFileForm.invalid) {
        return;
    }
    let skeleton = this.uploadFileForm.controls["skeletonTarget"].value;
    let dataType = this.uploadFileForm.controls["dataType"].value;
    let collectionID = this.currentCollection;
    let backendCall = (name: string, dataStr: any) => {
      this.dataService.addFile(collectionID, skeleton, name, dataType, dataStr).subscribe(
        (e: any)=>{
          this.getFileList();
        });
    };
    for (var i = 0; i < this.binaryFileList.length; i++) {
      let f = this.binaryFileList.item(i);
      this.uploadBinaryFile(f, backendCall);
  }
    modal.closeModal();
  }

  uploadCharacter(){
    // stop here if form is invalid
    if (this.editSkeletonForm.invalid) {
        return;
    }

    let skeletonName = this.currentSkeleton;
    let updateCallback =  (e: any) => {this.getCharacterModels(skeletonName);};
    let backendCall = (name: string, dataStr: any) => {
      this.dataService.uploadCharacter(name, skeletonName, dataStr, updateCallback);
    };
    for (var i = 0; i < this.characterFileList.length; i++) {
      let f = this.characterFileList.item(i);
      this.uploadBinaryFile(f, backendCall);
    }
  }

  deleteCharacter(characterName: string){
    let updateCallback = (e: any) => {this.getCharacterModels(this.currentSkeleton);};
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

  callExperiments(){
    this.activeTab ='tab2';
    //this.messageUnityInstance("WebGLHub", "LoadNewScene" ,"rest_interface_client");
  }

  callMotionState(){
    this.activeTab ='tab3';
    this.messageUnityInstance("WebGLHub", "LoadNewScene" ,"test");
  }

  editTagFromModal(modal: any){
    modal.closeModal();
    
    let name = this.editTagForm.controls["name"].value;
    if (this.selectedTagForModal == ""){
      this.dataService.addDataTag(name).subscribe(
        (data:any)=>{
          this.selectedTagForModal = "";
          this.getTagList();
        });
    }else{
      
      this.dataService.renameDataTag(this.selectedTagForModal, name).subscribe(
        (data:any)=>{
        this.selectedTagForModal = "";
        this.getTagList();
        });
    }
    
    this.activeModal = "";
  }

}
