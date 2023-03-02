import { Component, OnInit,ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { MessageService } from '../_services/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TreeModule, TreeComponent } from '@circlon/angular-tree-component';
import Chart from 'chart.js/auto';
import { StringLiteral } from 'node_modules_old/typescript/lib/typescript';

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
  public dataTransformList: any;

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

  public queuedFile: any;


    public currentExp: string = "";
    public colors: any = ["red","green",  "blue", "purple", "orange"]
    public showLabels : boolean = false;
  public chart: any;
    public plotData : any;

  error = '';

  skeletonSubmitted = false;
  collectionSubmitted = false;
  bvhSubmitted = false;
  uploadFileSubmitted = false;
  public runDataTransformSubmitted: boolean = false;
  
  addSkeletonForm: FormGroup;
  editSkeletonForm: FormGroup;
  newCollectionForm: FormGroup;
  bvhFileUploadForm: FormGroup;
  uploadFileForm: FormGroup;
  editTagForm: FormGroup;
  runDataTransformForm: FormGroup;

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
    this.getDataTypeList();
    this.getDataTransformList();

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
this.runDataTransformForm = this.formBuilder.group({
  name: [''],
  skeletonType: [''],
  storeLog: [''],
  hparams: [''],
  dataTransform: [''],
  inputs: this.formBuilder.array([])
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
  getDataTransformList(){
    this.dataService.getDataTransformList().subscribe(
      (dataTransformList:any) => {this.dataTransformList = dataTransformList;}
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

  openRemoveCollectionModal(){
    console.log("Click event fired: remove action");
    this.callModal("removeCollection");
  }

  removeCollection(collectionID: string){
    this.dataService.removeCollection(collectionID).subscribe(
      (data:any)=>{
        this.getCollections();
      }
    ); 
  }

  openDeleteFileModal(name: string, id: number){
    this.queuedFile = {id: id, name: name};
    this.callModal("deleteFile");
  }

  deleteFile(fileID:string){
    this.dataService.deleteFile(fileID).subscribe(
      (data:any)=>{this.getFileList();}
    ); 
    
  }

  downloadFile(fileID: string, name: string, dataType: string){
    if(dataType== "motion"){
        this.dataService.downloadClipAsBVH(fileID, name);
    }else{
      this.dataService.downloadFile(fileID, name+"."+dataType);
    }
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

  callMotionModelGraph(){
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

  
  openExperimentModal(exp:any){
    this.callModal('plotExperiment');
    this.currentExp = exp;
    this.plotExperiment(this.currentExp[0]);
  }

  openDeleteExperimentModal(exp:any){
    this.callModal('deleteExperiment');
    this.currentExp = exp;

  }

  plotExperiment(expId: string){
    this.dataService.getExperimentLog(expId).subscribe(
      (plotData:any) => {this.plotData = plotData;
        console.log(plotData);
        this.renderChart(plotData);
      }
      );
  }
  refreshPlotData(){
    this.dataService.getExperimentLog( this.currentExp[0]).subscribe(
      (plotData:any) => {this.plotData = plotData;
        console.log(plotData);
        this.updateChart(plotData);
      }
      );
  }
  
  renderChart(data : any)
  {
    
    this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: [ ], 
	       datasets: []
      },
      options: {
        aspectRatio:2.5
      }
      
    });
    this.updateChart(data);
  }
updateChart(data : any){
    if (data == null || data["log_data"] == null || data["field_names"] == null) return;
    this.chart.data.labels =[];
    let labelKey = 'time/total_timesteps';
    if(data["label_key"] !=null){
      labelKey =data["label_key"];
    }
    this.chart.data.datasets = [];
    for(let i = 0; i <data["field_names"].length; i++ ){
      if(i >= this.colors.length){
        console.log("Error index outside of colors array");
        return;
      }
      if(data["field_names"][i] == labelKey){
        if (this.showLabels){
          for(let j = 0; j <data["log_data"].length; j++ )this.chart.data.labels.push(data["log_data"][j][i]);
        }else{
          for(let j = 0; j <data["log_data"].length; j++ )this.chart.data.labels.push(j);
        }
      }else{
        let values = [];
        for(let j = 0; j <data["log_data"].length; j++ ){
          values.push(data["log_data"][j][i]);
        }
        let dataset = {
          label: data["field_names"][i],
          data: values,
          borderColor: this.colors[i]
        };
        this.chart.data.datasets.push(dataset);
      }
    }
   
    this.chart.update()
  }

  openRunDataTransformModal(){
    
    if(this.currentCollection == "")return;
    this.runDataTransformForm.controls["hparams"].setValue("{}");
    this.activeModal = "runDataTransform";
  }

  
  runDataTransformFromModal(modal: any){
    this.runDataTransformSubmitted = true;
    let data_transform_id =this.runDataTransformForm.controls["dataTransform"].value
    let exp_name =  this.runDataTransformForm.controls["name"].value;
    let skeleton_type = this.runDataTransformForm.controls["skeletonType"].value;
    let output_id = this.currentCollection;
    let input_data : Array<Array<string>> = [[this.currentCollection, 'motion', "1"]];
    let store_log = this.runDataTransformForm.controls["storeLog"].value;
    let hparams = JSON.parse(this.runDataTransformForm.controls["hparams"].value);
    //let hparamsStr = JSON.stringify(hparams); TODO build form for paramters
    this.dataService.runDataTransform(data_transform_id, exp_name, skeleton_type, output_id,  input_data, store_log, hparams).subscribe(
      (values :any) => {}
  );
    modal.closeModal();
    this.activeModal = "";
    
    this.runDataTransformSubmitted = false;
  }
}
