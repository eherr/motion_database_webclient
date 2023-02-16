import { Component, OnInit } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
//import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-data-transforms',
  templateUrl: './data-transforms.component.html',
  styleUrls: ['./data-transforms.component.less']
})
export class DataTransformsComponent implements OnInit {

  public dataTypeList: any;
  public dataTransformList: any;
  public selectedDataTransform: any;
  public editDataTransformSubmitted: boolean = false;
  public dataTransformInputs: any;
  public activeModal: string = "none";

  theme = 'vs-dark';
  editDataTransformForm: FormGroup;
  /*dataTransformCodeModel: CodeModel = {
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
    this.getDataTransformList();
    this.initForms();
  }
  initForms(){
    this.editDataTransformForm = this.formBuilder.group({
      name: ['', Validators.required],
      outputType: ['', Validators.required],
      dataTransform: ['', ],
      requirements: ['',],
      inputs: this.formBuilder.array([])
    });

  }

  get dataInputsControls(): FormArray {
    return this.editDataTransformForm.get('inputs') as FormArray;
  }

  get dataTransformCodeModel(): FormControl {
    return this.editDataTransformForm.get('dataTransform') as FormControl;
  }
  get requirementsModel(): FormControl {
    return this.editDataTransformForm.get('requirements') as FormControl;
  }
  getDataTransformList(){
    this.dataService.getDataTypeList().subscribe(
      (dataTypeList: any) => {
        this.dataTypeList = dataTypeList;
        }
      );
    this.dataService.getDataTransformList().subscribe(
      (dataTransforms: any) => {
        this.dataTransformList = dataTransforms;
        console.log(dataTransforms);

        }
      );
  }

  

  openEditDataTransformModal(dataTransform: any){
    console.log("open edit model"+dataTransform);
    this.selectedDataTransform = dataTransform;
    while(this.dataInputsControls.length > 0)this.dataInputsControls.removeAt(0);
    if (dataTransform != null){
      this.dataService.getDataTransformInfo(dataTransform).subscribe(
        (data:any)=>{
          this.editDataTransformForm.controls["name"].setValue(data["name"]);
          this.editDataTransformForm.controls["outputType"].setValue(data["outputType"]);
          this.dataTransformCodeModel.setValue(data["script"]);
          this.requirementsModel.setValue(data["requirements"]);
          //this.requirementsModel.value = data["requirements"];
          
          this.activeModal = "editDataTransform";
        })
        
        this.dataService.getDataTransformInputList(dataTransform).subscribe(
          (dataTransformInputs: any)=>{
            this.dataTransformInputs = dataTransformInputs;
           
            for(let i = 0; i < dataTransformInputs.length; i++){
              this.addDataTransformInputInModal();
              let inputDataType = this.dataInputsControls.at(i).get("inputDataType");
              if(inputDataType != null) inputDataType.setValue(dataTransformInputs[i][1]);
              let isCollection = this.dataInputsControls.at(i).get("isCollection");
              if(isCollection != null) isCollection.setValue(dataTransformInputs[i][2]);

            }
          }
        )
    } else{
      this.editDataTransformForm.controls["name"].setValue("");
      this.editDataTransformForm.controls["outputType"].setValue("");
   
      this.activeModal = "editDataTransform";
    }
  }

  editDataTransformFromModal(modal: any){

    console.log("editDataTransformFromModal"+this.selectedDataTransform);
    // stop here if form is invalid
    if (this.editDataTransformForm.invalid) {
      
        this.selectedDataTransform = null;
        return;
    }
    let name = this.editDataTransformForm.controls["name"].value;
    let outputType = this.editDataTransformForm.controls["outputType"].value;
    let scriptText = this.dataTransformCodeModel.value;
    let requirementsText = this.requirementsModel.value;

    if (this.selectedDataTransform == null){
      this.dataService.createDataTransform(name, scriptText,outputType, requirementsText).subscribe(
        (result: any)=>{
          let dtID = result["id"];
          this.addDataTransformInputsToDB(dtID);
        }
      );
    }else{
      
      this.dataService.deleteAllDataTransformInputs(this.selectedDataTransform).subscribe(
        (result: any)=>{
        }
      );
      this.dataService.editDataTransform(this.selectedDataTransform, name, scriptText, outputType, requirementsText).subscribe(
        (result: any)=>{
        }
      );
      this.addDataTransformInputsToDB(this.selectedDataTransform);
    }
    
    this.selectedDataTransform = null;
    this.getDataTransformList();
    modal.closeModal();
    this.activeModal = "";
  }

  addDataTransformInputsToDB(dataTransformID: string){
    for(let i = 0; i < this.dataInputsControls.length; i++){
      let inputDataType = this.dataInputsControls.at(i).get("inputDataType")?.value;
      let isCollection = this.dataInputsControls.at(i).get("isCollection")?.value;
      this.dataService.createDataTransformInput(dataTransformID, inputDataType, isCollection);
  }
  }

  callModal(modalName: string){
    this.activeModal = modalName;
  }
  addDataInputFormGroup(): FormGroup {
    return this.formBuilder.group({
      inputDataType: [""],
      isCollection: [""],
    });
  }
  addDataTransformInputInModal(){
    this.dataInputsControls.push(this.addDataInputFormGroup());
  }
  removeDataTransformInputInModal(idx: number){
    console.log("remove"+idx);
    this.dataInputsControls.removeAt(idx);
  }

  deleteDataTransform(){
    this.dataService.deleteDataTransform(this.selectedDataTransform); 
    this.dataService.deleteAllDataTransformInputs(this.selectedDataTransform).subscribe(
      (result: any)=>{
      }
    );
    this.selectedDataTransform=null; 
    this.getDataTransformList();
  }
}
