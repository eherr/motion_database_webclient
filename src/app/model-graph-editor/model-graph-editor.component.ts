
// https://visjs.github.io/vis-network/examples/
// https://visjs.github.io/vis-network/examples/network/events/interactionEvents.html
import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { TreeModule, TreeComponent } from '@circlon/angular-tree-component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { Network, Data, DataSet, Edge, Node as vNode, Options } from 'vis-network';
import { visitNode } from 'typescript';
@Component({
  selector: 'app-model-graph-editor',
  templateUrl: './model-graph-editor.component.html',
  styleUrls: ['./model-graph-editor.component.less']
})
export class ModelGraphEditorComponent implements OnInit {
  public collections: any[] = [];
  
  
  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public options = {
	
  };
  @ViewChild('mynetwork') networkWrapper: ElementRef;
   network : Network;
   public currentProject: number = 1;
   public currentSkeleton: string = "";
   public editModelGraphSubmitted: boolean = false;
   public skeletonList : any;
   public rootCollection : number = 0;
   public currentTag : string = "model";
   public projectInfo: any;
   public projectList: any;
   modelList: any;
   modelGraphList: any;
   selectedModelGraph: any;
   selectedModelGraphName: string
   activeModal : any;
   editModelGraphForm: FormGroup;
   nodes : Array<vNode>;
   edges : Array<Edge>;
   nodeTypes = ["single", "start", "idle", "end", "standard"];
   modelGraphDict : any;
   public currentCollection: string = "";
  constructor(public dataService: DataService,
    public formBuilder: FormBuilder,
    public user: UserService) {
      
    }
    ngOnInit() {
      this.currentProject = 1;
      this.getProjects();
      this.getSkeletonList();
      this.currentSkeleton = "custom";
      this.initProject();
      this.initForms();
     
    }
    getSkeletonList(){
      this.dataService.getSkeletonModels().subscribe(
        (skeletons :any)  => this.skeletonList = skeletons
        );
    }
  
    initForms(){
      this.editModelGraphForm = this.formBuilder.group({
        name: ['', Validators.required],
        nodeName :[''],
        nodeType :['']
      });
  
      
    }
    getModelGraphList(){
      this.dataService.getModelGraphList(this.currentSkeleton, this.currentProject).subscribe(
        (modelGraphList: any) => {
          this.modelGraphList = modelGraphList;
          }
        );
    }


    removeModelGraph(){
      this.dataService.removeModelGraph(this.selectedModelGraph).subscribe(
        (data:any)=> {
          this.getModelGraphList();
          }
        );
    }

  selectSkeleton(event: any){
    console.log("Selected Skeleton: " + event);
    this.getModelGraphList();
  }
  
  callModal(modalName: string){
    this.activeModal = modalName;
  }

  openEditGraphModal(modelGraphID: any, modelGraphName:any){
    this.activeModal = "editModelGraph";
    this.selectedModelGraph = modelGraphID;
    this.selectedModelGraphName = modelGraphName;
    this.editModelGraphSubmitted= false;
    if (modelGraphID != null){
      this.editModelGraphForm.controls["name"].setValue(modelGraphName);
      this.dataService.getModelGraph(modelGraphID).subscribe(
      (data:any)=>{
        
        console.log(data);
        this.modelGraphDict = data;
        console.log(this.modelGraphDict);
        this.updateGraph();
      });
    }else{
      this.modelGraphDict = {"nodes":{}, "startNode": []};
      
      this.dataService.getSkeletonModels().subscribe(
        (skeletons :any)  =>{this.updateGraph();}
        );
    }

  }

  editModelGraphFromModal(modal: any){
    
    
    let newName = this.editModelGraphForm.controls["name"].value;
    if(this.selectedModelGraph != null){
    this.dataService.editModelGraph(this.selectedModelGraph, newName, this.modelGraphDict).subscribe((data:any)=>{
      modal.closeModal();
      this.editModelGraphSubmitted= false;

    });
  }else{
    this.dataService.addModelGraph(newName, this.currentProject, this.currentSkeleton,this.modelGraphDict).subscribe((data:any)=>{
      modal.closeModal();
      this.editModelGraphSubmitted= false;
      this.getModelGraphList();
    });
  }


  }

  initGraph(event:any){
    this.updateGraph();
  }

  updateGraph(){
    console.log("create");
    
    console.log(this.networkWrapper);
    this.nodes = [{ id: "Root", label: "Root"}];
    this.edges= [];
    if (this.modelGraphDict != null){
      for (let action in this.modelGraphDict["nodes"]) {
        let node = {id: action, 
                    label:action, color: "red"};
        this.nodes.push(node);
        let edge = {from: "Root", to: action};
        this.edges.push(edge);
        for (let node_id in this.modelGraphDict["nodes"][action]) {
          let name = this.modelGraphDict["nodes"][action][node_id]["name"];
          let node = {id: action+":"+name, 
                      label:name};
          this.nodes.push(node);
          let edge = {from: action, to: action+":"+name};
          this.edges.push(edge);
        }
    }
    
    for (let action in this.modelGraphDict["nodes"]) {
      for (let node_id in this.modelGraphDict["nodes"][action]) {
        let name = this.modelGraphDict["nodes"][action][node_id]["name"];
        let transitions = this.modelGraphDict["nodes"][action][node_id]["transitions"];
        for (let to_key in transitions) {
          //let to_node_id = transitions[to_key]["model_id"];
          let edge = {from: action+":"+name, to: to_key};
          this.edges.push(edge);
        }
        }
      }
    }
    
    // create a network
    this.options = {height: "600", width: "800", manipulation:{enabled: true}, physics:{ "repulsion":{nodeDistance:80}} };
     console.log(this.networkWrapper);
    this.network = new Network(this.networkWrapper.nativeElement, {nodes:this.nodes, edges:  this.edges}, this.options);
    this.network.on("selectNode", (event: any) => {
        this.onSelectNode(this, event);
      });
    this.network.on("deselectNode", (event: any) => {
        this.onDeselectNode(this, event);
      });
    this.network.on("controlNodeDragEnd", (event: any) => {
      this.onControlNodeDragEnd(this, event);
    });
    
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
        this.rootCollection = this.projectInfo["collection"];
      this.getModelGraphList();
    }
    );
  }

  selectProject(event: any){
    console.log("Selected project: " + event);
    this.initProject();

  }

  onSelectFile(event: any){
    let fileID = event[0];
    let fileName = event[1];
    let fileType = event[2];
    let selectedNodes = this.network.getSelectedNodes();
    if(this.modelGraphDict != null && selectedNodes.length > 0){
      let currentNode :string = selectedNodes[0].toString();
      let isAction =  (currentNode.indexOf(':') == -1);
      if (isAction){
          console.log("Selected file: " + fileID, fileName);
          let new_node = {name:fileName, transitons:[], type: "single"};
          console.log("add file: " +fileName+ "to action"+currentNode);
          this.modelGraphDict["nodes"][currentNode][fileID] = new_node;
        // this.nodes.push({id: fileID, label: fileName});
        // let edge = {from: currentAction, to: fileID};
          //this.edges.push(edge);
          //this.network.setData({nodes:this.nodes, edges:  this.edges})
          //this.network.addNodeMode();
          this.updateGraph();
    }
  }

  }

  deleteGraphNode(){
    let selectedNodes = this.network.getSelectedNodes();
    if(this.modelGraphDict != null && selectedNodes.length > 0){
      let currentNode :string = selectedNodes[0].toString();
      let isAction =  (currentNode.indexOf(':') == -1);
      if (isAction){
        console.log("delete" +currentNode);
        delete this.modelGraphDict["nodes"][currentNode];
      }else{
        let action = currentNode.split(":")[0];
        let model = currentNode.split(":")[1];
        let nodeKey = this.findModelIDByName(action, model);
        if(nodeKey != ""){
          console.log("delete" +action+ ""+nodeKey);
          delete this.modelGraphDict["nodes"][action][nodeKey];

        }else{
          
        console.log("did not find" +action, model);
        }


      }
      this.updateGraph();
     // this.network.deleteSelected();
      //this.network.setData({nodes:this.nodes, edges:  this.edges})
    }

  }

  findModelIDByName(action: string, model: string){
      let nodeKey = "";
      for (let key in this.modelGraphDict["nodes"][action]) {
        //let to_node_id = transitions[to_key]["model_id"];
        let name = this.modelGraphDict["nodes"][action][key]["name"];
        console.log("check" +name+ " key"+ model);
        if(name == model){
          nodeKey = key;
          break;
        }
      }
      return nodeKey;
  }

  deleteGraphEdge(){
    let selectedEdges = this.network.getSelectedEdges();
    if(this.modelGraphDict != null && selectedEdges.length > 0){
      //let currentAction = selectedNodes[0]
      this.network.deleteSelected();
      //this.network.setData({nodes:this.nodes, edges:  this.edges})
    }

  }
  onSelectNode(self:any, params: any){
    console.log("selectNode Event:", params);
    let nodeName :string = params["nodes"][0].toString();
    if(nodeName.indexOf('Root') > -1){
      return; //root node allow creating actions
    }
    let isAction =  (nodeName.indexOf(':') == -1);
    if (isAction){
      self.editModelGraphForm.controls["nodeName"].setValue(nodeName);
    }else{
      let action = nodeName.split(":")[0];
      let model = nodeName.split(":")[1];
      self.editModelGraphForm.controls["nodeName"].setValue(model);
      let nodeKey = this.findModelIDByName(action, model);
      //read node type
      if (nodeKey !=""){
        let nodeType = this.modelGraphDict["nodes"][action][nodeKey]["type"];
        self.editModelGraphForm.controls["nodeType"].setValue(nodeType);
      }
    }
  }

  onDeselectNode(self:any, params: any){
    self.editModelGraphForm.controls["nodeName"].setValue("");
    self.editModelGraphForm.controls["nodeType"].setValue("");
  }

  addTransitionToGraph(fromKey: string, toKey: string){
    
    let fromAction = fromKey.split(":")[0];
    let fromModel = fromKey.split(":")[1];
    let fromNodeID = this.findModelIDByName(fromAction, fromModel);
    let toAction = toKey.split(":")[0];
    let toModel = toKey.split(":")[1];
    let toNodeID = this.findModelIDByName(toAction, toModel);
    if (fromNodeID !="" && toNodeID != ""){
      let newTransiton = {action_name: toAction, model_id: parseInt(toNodeID), model_name: toModel};
      this.modelGraphDict["nodes"][fromAction][fromNodeID]["transitions"][toKey] = newTransiton;
      console.log("created transition");
      return true;
    }
    return false;
  }

  onControlNodeDragEnd(self:any, params: any){
    console.log(params);
    if(params["controlEdge"].from == undefined || params["controlEdge"].to == undefined)return;
    let fromKey = params["controlEdge"].from.toString();
    let toKey = params["controlEdge"].to.toString();
    let success = false;
    if (fromKey.indexOf(':') >-1 && toKey.indexOf(':') >-1){
      success = self.addTransitionToGraph(fromKey, toKey);

    }
    self.updateGraph();
  }

  addActionNode(){
    let nodeName = this.editModelGraphForm.controls["nodeName"].value;
    if (nodeName != ""){
      this.modelGraphDict["nodes"][nodeName] = {}
      

      this.updateGraph();
    }
  }

  updateNode(){
    //read node name
    
    let selectedNodes = this.network.getSelectedNodes();
   
    if(this.modelGraphDict != null && selectedNodes.length > 0){
      let currentNode :string = selectedNodes[0].toString();
      if(currentNode.indexOf('Root') > -1)return; //root node cant be modified
      let isAction =  (currentNode.indexOf(':') == -1);
      let newName = this.editModelGraphForm.controls["nodeName"].value;
      if(isAction){
        
        this.modelGraphDict["nodes"][newName] = this.modelGraphDict["nodes"][currentNode];
        delete this.modelGraphDict["nodes"][currentNode];

      }else{
        let action = currentNode.split(":")[0];
        let model = currentNode.split(":")[1];
        let nodeKey = this.findModelIDByName(action, model);
        //read node type
        if (nodeKey !=""){
            let nodeType = this.editModelGraphForm.controls["nodeType"].value;
            this.modelGraphDict["nodes"][action][nodeKey]["name"] = newName;
            this.modelGraphDict["nodes"][action][nodeKey]["type"] = nodeType;
         }
        


      }
      this.updateGraph();
    }


  }
  addTransiton(){
    this.network.enableEditMode();
    this.network.addEdgeMode();

  }
  setStartNode(){
    let selectedNodes = this.network.getSelectedNodes();
    if(this.modelGraphDict != null && selectedNodes.length > 0){
      let currentNode :string = selectedNodes[0].toString();
      if  ( currentNode.indexOf('Root') == -1 && currentNode.indexOf(':') > -1){
        let action = currentNode.split(":")[0];
        let model = currentNode.split(":")[1];
        this.modelGraphDict["startNode"] = [action, model];
        console.log("set start node",this.modelGraphDict["startNode"]);
      }
  }
}

}