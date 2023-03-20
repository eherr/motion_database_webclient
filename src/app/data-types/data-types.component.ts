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

  public selectedTagList: any;
  public allTagsList: any;
  
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
    this.getDataTypeList();
    this.initForms();
  }
  initForms(){
    this.editDataTypeForm = this.formBuilder.group({
      name: ['', Validators.required],
      assignedTags: ['', ],
      tagList: ['', ],
        requirements: ['', ],
    });
    this.editDataLoaderForm = this.formBuilder.group({
      dataType: ['', Validators.required],
        engine: ['', Validators.required],
        loader: ['', ],
        requirements: ['', ],
    });

    
  }
  getDataTypeList(){
    this.dataService.getTagList().subscribe(
      (tagList: any) => {
        this.allTagsList = tagList;
        }
      );
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
      });
    }else{
      this.editDataTypeForm.controls["name"].setValue("");
      this.editDataTypeForm.controls["requirements"].setValue("");

    }
    this.activeModal = "editDataType";
    this.dataService.getDataTypeTagList(dataType).subscribe(
      (selectedTagList:any) => {
        this.selectedTagList = [];
        for(let i = 0; i < selectedTagList.length; i++){
          this.selectedTagList.push(selectedTagList.at(i)[0]);
        }
      }
    )

  }
  editDataTypeFromModal(modal: any){
    modal.closeModal();
    
    let name = this.editDataTypeForm.controls["name"].value;
    let requirements = this.editDataTypeForm.controls["requirements"].value;
    let dataType = this.selectedDataType;
    if (dataType == null){
      this.dataService.createDataType(name, requirements).subscribe(
        (data:any)=>{
          this.addTagsToDB(dataType);
          this.selectedDataType = null;
          this.getDataTypeList();
        });
    }else{
      
      this.dataService.editDataType(dataType, name, requirements).subscribe(
        (data:any)=>{
          
        this.dataService.removeAllDataTypeTags(dataType).subscribe(()=>{
          this.addTagsToDB(dataType);
        });
        this.selectedDataType = null;
        this.getDataTypeList();
        });
    }
    
    this.activeModal = "";
  }


  addTagsToDB(dataType: string){
    for(let i = 0; i < this.selectedTagList.length; i++){
      let tagName = this.selectedTagList.at(i);
      this.dataService.addDataTypeTag(dataType, tagName).subscribe(()=>{
    });
  }
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
          this.getDataTypeList();
        });
    }else{
      this.dataService.deleteDataLoader(this.selectedDataType, this.selectedEngine).subscribe(
        (data:any)=>{
        this.dataService.createDataLoader(dataType, engine, loaderText, requirementsText).subscribe(
          (data:any)=>{
            this.getDataTypeList();
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
    this.getDataTypeList();
  })
  }

  deleteDataLoader(){
    this.dataService.deleteDataLoader(this.selectedDataType, this.selectedEngine).subscribe(
      (data:any)=>{ 
    this.selectedDataType=null; 
    this.selectedEngine=null; 
    this.getDataTypeList();
  })
  }

  assignTag(){
    let selectedTags = this.editDataTypeForm.controls["tagList"].value;
   
    for (let newTag of selectedTags){
      let addTag = true;
      for (let tag of this.selectedTagList){
          if(newTag == tag){
              addTag = false;
              break;
          }
      }
      if(addTag)this.selectedTagList.push(newTag[0]);
    }
  }
  removeTag(){
    let selectedTags = this.editDataTypeForm.controls["assignedTags"].value;
    let newTagList = [];
    for (let tag of this.selectedTagList){
        let removeTag = false;
        for(let idx in selectedTags){
            if(selectedTags[idx] == tag){
                removeTag = true;
                break;
            }
        }
        if(!removeTag){
          newTagList.push(tag);
        }
    }
    this.selectedTagList = newTagList;
  }
}
