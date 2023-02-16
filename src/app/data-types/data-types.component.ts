import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
//import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-data-types',
  templateUrl: './data-types.component.html',
  styleUrls: ['./data-types.component.less']
})
export class DataTypesComponent implements OnInit{

  
  public dataTypeList: any;
  public loaderScripts: any;
  public selectedDataType: any;
  public selectedEngine: any;
  
  public editDataTypeSubmitted: boolean = false;
  public editDataLoaderSubmitted: boolean = false;
  public activeModal: string = "none";
  theme = 'vs-dark';
  editDataTypeForm: FormGroup;
  editDataLoaderForm: FormGroup;
  /*loaderCodeModel: CodeModel = {
   language: 'python',
   uri:  "loader.python",
   value: '',
 };
 requirementsModel: CodeModel = {
  language: 'python',
  uri:  "req.python",
  value: '',
};*/


  public options = {
	
  };
  constructor(public dataService: DataService,
    public formBuilder: FormBuilder,
    public router: Router,
    public user : UserService) {
    }

   ngOnInit() {
    this.getDataLoaderList();
    this.initForms();
  }
  initForms(){
    this.editDataTypeForm = this.formBuilder.group({
      name: ['', Validators.required],
        isSkeletonMotion: ['', ],
        isModel: ['', ],
        isTimeSeries: ['', ],
        isProcessed: ['', ],
        requirements: ['', ],
    });
    this.editDataLoaderForm = this.formBuilder.group({
      dataType: ['', Validators.required],
        engine: ['', Validators.required],
        loader: ['', ],
        requirements: ['', ],
    });

    
  }
  getDataLoaderList(){
    this.dataService.getDataTypeList().subscribe(
      (dataTypeList: any) => {
        this.dataTypeList = dataTypeList;
        }
      );
    this.dataService.getDataLoaderList().subscribe(
      (loaderScripts: any) => {
        this.loaderScripts = loaderScripts;
        }
      );
  }
  callModal(modalName: string){
    this.activeModal = modalName;
  }
  openEditDataTypeModal( dataType: any){
    
    this.selectedDataType = dataType;
    if (dataType != null){
    this.dataService.getDataTypeInfo(dataType).subscribe(
      (data:any)=>{
        this.editDataTypeForm.controls["name"].setValue(data["name"]);
        this.editDataTypeForm.controls["requirements"].setValue(data["requirements"]);
        
        this.editDataTypeForm.controls["isModel"].setValue(data["isModel"]);
        this.editDataTypeForm.controls["isProcessed"].setValue(data["isProcessed"]);
        this.editDataTypeForm.controls["isTimeSeries"].setValue(data["isTimeSeries"]);
        this.editDataTypeForm.controls["isSkeletonMotion"].setValue(data["isSkeletonMotion"]);
      });
    }else{
      this.editDataTypeForm.controls["name"].setValue("");
      this.editDataTypeForm.controls["requirements"].setValue("");
      this.editDataTypeForm.controls["isModel"].setValue(0);
      this.editDataTypeForm.controls["isProcessed"].setValue(0);
      this.editDataTypeForm.controls["isTimeSeries"].setValue(0);
      this.editDataTypeForm.controls["isSkeletonMotion"].setValue(0);

    }
    this.activeModal = "editDataType";
  }
  editDataTypeFromModal(modal: any){
    modal.closeModal();
    
    let name = this.editDataTypeForm.controls["name"].value;
    let requirements = this.editDataTypeForm.controls["requirements"].value;
    let isModel = this.editDataTypeForm.controls["isModel"].value;
    let isProcessed = this.editDataTypeForm.controls["isProcessed"].value;
    let isTimeSeries = this.editDataTypeForm.controls["isTimeSeries"].value;
    let isSkeletonMotion = this.editDataTypeForm.controls["isSkeletonMotion"].value;
    if (this.selectedDataType == null){
      this.dataService.createDataType(name, requirements, isModel, isProcessed, isTimeSeries, isSkeletonMotion).subscribe(
        (data:any)=>{
          this.selectedDataType = null;
          this.getDataLoaderList();
        });
    }else{
      
      this.dataService.editDataType(this.selectedDataType, name, requirements, isModel, isProcessed, isTimeSeries, isSkeletonMotion).subscribe(
        (data:any)=>{
          
          this.selectedDataType = null;
          this.getDataLoaderList();
        });
    }
    this.activeModal = "";
    this.selectedDataType = null;
  }

  openEditDataLoaderModal( dataType: any, engine: any){
    console.log("open edit model");
    this.selectedDataType = dataType;
    this.selectedEngine = engine;
    if (dataType != null){
      this.dataService.getDataLoaderInfo(dataType, engine).subscribe(
        (data:any)=>{
          this.editDataLoaderForm.controls["dataType"].setValue(data["dataType"]);
          this.editDataLoaderForm.controls["engine"].setValue(data["engine"]);
          this.loaderCodeModel.setValue(data["script"]);
         this.requirementsModel.setValue(data["requirements"]);
          
          
          this.activeModal = "editDataLoader";
        })

    } else{
      this.editDataLoaderForm.controls["dataType"].setValue("");
      this.editDataLoaderForm.controls["engine"].setValue("");
      this.loaderCodeModel.setValue("");
      this.requirementsModel.setValue("");
    
      this.activeModal = "editDataLoader";
    }
  }
 
  editDataLoaderFromModal(modal: any){

    // stop here if form is invalid
    if (this.editDataLoaderForm.invalid) {
      
        this.selectedDataType = null;
        return;
    }
    modal.closeModal();
    let dataType = this.editDataLoaderForm.controls["dataType"].value;
    let engine = this.editDataLoaderForm.controls["engine"].value;
    let loaderText = this.loaderCodeModel.value;
    let requirementsText = this.requirementsModel.value;
    console.log(loaderText);
  
    if (this.selectedDataType == null){
      this.dataService.createDataLoader(dataType, engine, loaderText, requirementsText).subscribe(
        (data:any)=>{
          this.selectedDataType = null;
          this.selectedEngine = null;
          this.getDataLoaderList();
        });
    }else{
      this.dataService.deleteDataLoader(this.selectedDataType, this.selectedEngine).subscribe(
        (data:any)=>{
        this.dataService.createDataLoader(dataType, engine, loaderText, requirementsText).subscribe(
          (data:any)=>{
            this.getDataLoaderList();
          });
      })
    }
    
    this.selectedDataType = null;
    this.selectedEngine = null;
  
  }
  
  
  get loaderCodeModel(): FormControl {
    return this.editDataLoaderForm.get('loader') as FormControl;
  }
  get requirementsModel(): FormControl {
    return this.editDataLoaderForm.get('requirements') as FormControl;
  }
  deleteDataType(){
    this.dataService.deleteDataType(this.selectedDataType).subscribe(
      (data:any)=>{ 
    this.selectedDataType=null; 
    this.selectedEngine=null; 
    this.getDataLoaderList();
  })
  }

  deleteDataLoader(){
    this.dataService.deleteDataLoader(this.selectedDataType, this.selectedEngine).subscribe(
      (data:any)=>{ 
    this.selectedDataType=null; 
    this.selectedEngine=null; 
    this.getDataLoaderList();
  })
  }
}
