import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public experimentList: any;
  public selectedExperiment: any;
  public collections: any[] = [];

  
  public currentCollection: string=  "";
  
  public currentProject: number = 1;
  public activeModal: string = "none";
  public currentExp: string = "";

  public chart: Chart;
  public plotData : any;

  constructor(public dataService: DataService,
              public formBuilder: FormBuilder,
              public router: Router,
              public user : UserService) {
              }

  ngOnInit() {
    this.getProjects();
    this.selectProject(null);
    this.createChart();

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
	       datasets: [
          {
            label: "rewards",
            data: [],
            borderColor: 'blue'
          },
          {
            label: "steps",
            data: [],
            borderColor: 'limegreen'
          }  
        ]
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
    let labelIndex = 0;
    let dataSetIndex =0;
    let indexMap = [];
    let labelKey = 'time/total_timesteps';
    if(data["label_key"] !=null){
      labelKey =data["label_key"];

    }
    for(let i = 0; i <data["field_names"].length; i++ ){
      if(data["field_names"][i] != labelKey){
        this.chart.data.datasets[dataSetIndex]["data"] = [];
        this.chart.data.datasets[dataSetIndex].label = data["field_names"][i];
        indexMap.push(dataSetIndex);
        dataSetIndex++;
      }else{
        labelIndex = i;
      }
    }
    for(let i = 0; i <data["log_data"].length; i++ ){
      this.chart.data.labels.push(data["log_data"][labelIndex][labelIndex]);
      for (let j = 0; j < indexMap.length;j++){
        let srcIdx = indexMap[j];
        this.chart.data.datasets[j]["data"].push(data["log_data"][i][srcIdx]);
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
}
