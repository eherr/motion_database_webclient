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

  public evalScriptList: any;
  public selectedModelType: any;
  public selectedEngine: any;
  
  public editEvalScriptSubmitted: boolean = false;
  public activeModal: string = "none";
  theme = 'vs-dark';
  editEvalScriptForm: FormGroup;
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
    this.getEvalScriptList();
    this.initForms();
  }
  initForms(){
    this.editEvalScriptForm = this.formBuilder.group({
      modelType: ['', Validators.required],
        engine: ['', Validators.required],
        //loader: this.formBuilder.group({
        //  editorContent: [''],}),
        //requirements: ['']
    });

    
  }
  getEvalScriptList(){
    this.dataService.getEvalScriptList().subscribe(
      (evalScriptList: any) => {
        this.evalScriptList = evalScriptList;
        }
      );
  }
  callModal(modalName: string){
    this.activeModal = modalName;
  }

  editgetEvalScriptListFromModal(modal: any){

    // stop here if form is invalid
    if (this.editEvalScriptForm.invalid) {
      
        this.selectedModelType = null;
        return;
    }
    modal.closeModal();
    let modelType = this.editEvalScriptForm.controls["modelType"].value;
    let engine = this.editEvalScriptForm.controls["engine"].value;
    let loaderText = this.loaderCodeModel.value;
    let requirementsText = this.requirementsModel.value;
    console.log(loaderText);
  
    if (this.selectedModelType == null){
      this.dataService.createEvalScript(modelType, engine, loaderText, requirementsText);
    }else{
      this.dataService.editEvalScript(modelType, engine, loaderText, requirementsText);
    }
    
    this.selectedModelType = null;
    this.getEvalScriptList();
  }
  

  openEditEvalScriptModal(modelType: any, engine: any){
    console.log("open edit model");
    this.selectedModelType = modelType;
    this.selectedEngine = engine;
    if (modelType != null){
      this.dataService.getEvalScriptInfo(modelType, engine).subscribe(
        (data:any)=>{
          this.editEvalScriptForm.controls["modelType"].setValue(data["modelType"]);
          this.editEvalScriptForm.controls["engine"].setValue(data["engine"]);
          this.loaderCodeModel.value = data["script"];
          this.requirementsModel.value = data["requirements"];
          //this.editEvalScriptForm.controls["loader"].setValue(data["loader"]);
          
          this.activeModal = "editEvalScript";
        })
    } else{
      this.editEvalScriptForm.controls["modelType"].setValue("");
      this.editEvalScriptForm.controls["engine"].setValue("");
      //this.editEvalScriptForm.controls["requirements"].setValue("");
      //this.editEvalScriptForm.controls["loader"].setValue("");
    
      this.activeModal = "editEvalScript";
    }
  }
 
  
}
