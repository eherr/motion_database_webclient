import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-model-types',
  templateUrl: './model-types.component.html',
  styleUrls: ['./model-types.component.less']
})
export class ModelTypesComponent implements OnInit{

  public modelTypeList: any;
  public selectedModelType: any;
  
  public editModelTypeSubmitted: boolean = false;
  public activeModal: string = "none";
  theme = 'vs-dark';
  editModelTypeForm: FormGroup;
  loaderCodeModel: CodeModel = {
   language: 'python',
   uri:  "loader.python",
   value: '',
 };
 requirementsModel: CodeModel = {
  language: 'python',
  uri:  "req.python",
  value: '',
};


  public options = {
	
  };
  constructor(public dataService: DataService,
    public formBuilder: FormBuilder,
    public router: Router,
    public user : UserService) {
    }

   ngOnInit() {
    this.getModelTypeList();
    this.initForms();
  }
  initForms(){
    this.editModelTypeForm = this.formBuilder.group({
        name: ['', Validators.required],
        //loader: this.formBuilder.group({
        //  editorContent: [''],}),
        //requirements: ['']
    });

    
  }
  getModelTypeList(){
    this.dataService.getModelTypeList().subscribe(
      (modelTypeList: any) => {
        this.modelTypeList = modelTypeList;
        }
      );
  }
  callModal(modalName: string){
    this.activeModal = modalName;
  }

  editModelTypeFromModal(modal: any){

    // stop here if form is invalid
    if (this.editModelTypeForm.invalid) {
      
        this.selectedModelType = null;
        return;
    }
    modal.closeModal();
    let name = this.editModelTypeForm.controls["name"].value;
    let loaderText = this.loaderCodeModel.value;
    let requirementsText = this.requirementsModel.value;
    console.log(loaderText);
  
    if (this.selectedModelType == null){
      this.dataService.createModelType(name, loaderText, requirementsText);
    }else{
      this.dataService.editModelType(name, loaderText, requirementsText);
    }
    
    this.selectedModelType = null;
    this.getModelTypeList();
  }
  

  openEditModelTypeModal(modelType: any){
    console.log("open edit model");
    this.selectedModelType = modelType;
    if (modelType != null){
      this.dataService.getModelTypeInfo(modelType).subscribe(
        (data:any)=>{
          this.editModelTypeForm.controls["name"].setValue(data["name"]);
          this.loaderCodeModel.value = data["loader"];
          this.requirementsModel.value = data["requirements"];
          //this.editModelTypeForm.controls["loader"].setValue(data["loader"]);
          
          this.activeModal = "editModelType";
        })
    } else{
      this.editModelTypeForm.controls["name"].setValue("");
      //this.editModelTypeForm.controls["requirements"].setValue("");
      //this.editModelTypeForm.controls["loader"].setValue("");
    
      this.activeModal = "editModelType";
    }
  }
 
  
}
