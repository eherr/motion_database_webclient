import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import Chart from 'chart.js/auto';

import { TreeModule, TreeComponent } from '@circlon/angular-tree-component';


@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.less'],
  host: {'class': 'padded-col fill-col', 'id': 'experiments'}
})
export class ExperimentsComponent implements OnInit {

  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public projectList: any;
  public projectInfo: any;
  public dataTransformList: any;
  public skeletonList: any;
  public experimentList: any;
  public selectedExperiment: any;
  public collections: any[] = [];

  runDataTransformForm: FormGroup;
  public runDataTransformSubmitted: boolean = false;
  
  public currentCollection: string=  "";
  
  public currentProject: number = 1;
  public activeModal: string = "none";
  public currentExp: string = "";
  public colors: any = ["red","green",  "blue", "purple", "orange"]
  public showLabels : boolean = false;

  public chart: Chart;
  public plotData : any;

  constructor(public dataService: DataService,
              public formBuilder: FormBuilder,
              public router: Router,
              public user : UserService) {
              }

  ngOnInit() {
    this.getDataTransformList();
    this.getSkeletonList();
    this.getProjects();
    this.initForms();
    this.selectProject(null);
    this.createChart();

  }

  initForms(){
    this.runDataTransformForm = this.formBuilder.group({
      name: [''],
      skeletonType: [''],
      storeLog: [''],
      hparams: [''],
      dataTransform: [''],
      inputs: this.formBuilder.array([])
    });

  }
  
  ngAfterInit() {
 
    let firstNode = this.treeComponent.treeModel.getFirstRoot();
    
    firstNode.setActiveAndVisible();
  }
  
  createChart(){
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
  }
    
  updateChart(data : any)
  {
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

  refreshData(){
    if(this.currentCollection == "")return;
    this.selectCollection(this.currentCollection);
    this.plotExperiment(this.currentExp);
  }

  getExperimentList(collectionID: string){
    this.dataService.getExperimentList(collectionID).subscribe(
      (experimentList:any) => {this.experimentList = experimentList;}
      );
  }

  
  getSkeletonList(){
    this.dataService.getSkeletonModels().subscribe(
      (skeletonList:any) => {this.skeletonList = skeletonList;}
      );
  }
  getDataTransformList(){
    this.dataService.getDataTransformList().subscribe(
      (dataTransformList:any) => {this.dataTransformList = dataTransformList;}
      );
  }
  openDeleteExperimentModal(experiment: any){
    console.log("open deleteExperiment model");
    this.selectedExperiment = experiment, 
    this.activeModal = "deleteExperiment";
  }

  callModal(modalName: string){
      this.activeModal = modalName;
  }

  plotExperiment(expId: string){
    if(expId == "") return;
    this.currentExp = expId;
    this.dataService.getExperimentLog(expId).subscribe(
      (plotData:any) => {this.plotData = plotData;
        console.log(plotData);
        this.updateChart(plotData);}
      );
  }

  downloadModel(expId: string){
    this.dataService.getExperimentInfo(expId).subscribe(
      (info:any) => {
        let name = info["name"];
        let modelId = info["model"];
        this.dataService.downloadModel(modelId, name);
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
  selectProject(event: any){
    console.log("Selected project: " + event);
    
    let projectID = this.currentProject.toString();
    this.dataService.getProjectInfo(projectID).subscribe(
      (projectInfo:any) => {
        this.projectInfo = projectInfo;
        this.getCollections();
        let parentID = this.projectInfo["collection"];
        this.selectCollection(parentID, );
      }
    );
  }
  onSelectNode(event: any){
    this.selectCollection(event.node.data.id);
  }

  getCollections(){
	  //this.tree = document.getElementById("collectionTree");
    let parentID = this.projectInfo["collection"];
    let parentNode = null;
    this.queryCollectionTree(parentID, parentNode);
  }

  selectCollection(id: string){
    console.log("select collection", id);
    this.currentCollection = id;
    this.getExperimentList(id);
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

  
  openRunDataTransformModal(){
    if(this.currentCollection == "")return;
    this.runDataTransformForm.controls["hparams"].setValue("{}");
    this.activeModal = "runDataTransform";
  }


  
  runDataTransformFromModal(modal: any){
    let data_transform_id =this.runDataTransformForm.controls["dataTransform"].value
    let exp_name =  this.runDataTransformForm.controls["name"].value;
    let skeleton_type = this.runDataTransformForm.controls["skeletonType"].value;
    let output_id = this.currentCollection;
    let input_data : Array<Array<string>> = [[this.currentCollection, 'motion', "1"]];
    let store_log = this.runDataTransformForm.controls["storeLog"].value;
    let hparamsStr = this.runDataTransformForm.controls["hparams"].value;
    //let hparamsStr = JSON.stringify(hparams); TODO build form for paramters
    this.dataService.runDataTransform(data_transform_id, exp_name, skeleton_type, output_id,  input_data, store_log, hparamsStr).subscribe(
      (values :any) => {}
  );
    modal.closeModal();
    this.activeModal = "";
  }
  addDataInputFormGroup(): FormGroup {
    return this.formBuilder.group({
      inputDataType: [""],
      isCollection: [""],
    });
  }  
  
  get dataInputsControls(): FormArray {
    return this.runDataTransformForm.get('inputs') as FormArray;
  }

  addDataTransformInputInModal(){
    this.dataInputsControls.push(this.addDataInputFormGroup());
  }
  removeDataTransformInputInModal(idx: number){
    console.log("remove"+idx);
    this.dataInputsControls.removeAt(idx);
  }
}
