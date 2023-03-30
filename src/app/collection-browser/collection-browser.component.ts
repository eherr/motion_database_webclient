
import { Component, OnInit,ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { TreeModule, TreeComponent } from '@circlon/angular-tree-component';
import { DataService } from '../_services/data.service';

@Component({
  selector: 'app-collection-browser',
  templateUrl: './collection-browser.component.html',
  styleUrls: ['./collection-browser.component.less']
})
export class CollectionBrowserComponent implements OnInit {

  
  @Input() rootCollection: number = 0;
  @Input() currentSkeleton: string = "";
  @Input() currentTag: string = "";
  @Output()  selectFileEvent: EventEmitter<any> = new EventEmitter<any>();
  public collections: any[] = [];
  
  public currentCollection: string = "";
  public currentCollectionName: string = "";
  fileList: any;
  
  @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
  public options = {}
  constructor(public dataService: DataService) {
    }
  ngOnInit() {
    this.getCollections();
    
  }
  ngAfterInit() {
    let firstNode = this.treeComponent.treeModel.getFirstRoot();
    
    firstNode.setActiveAndVisible();
  }
  getCollections(){
	  //this.tree = document.getElementById("collectionTree");
    let parentID = this.rootCollection;
    let parentNode = null;
    this.queryCollectionTree(parentID, parentNode);
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
  onSelectNode(event: any){
    console.log("select node", event.node.data);
    this.selectCollection(event.node.data.id, event.node.data.name);
  }
  selectCollection(id: string, name: string){
    this.currentCollection = id;
    this.currentCollectionName = name;
    console.log("Selected Collection: " + id);
    this.getFileList();
  }
  getFileList(){
    let tagFilterList = [this.currentTag];
    this.dataService.getFileList(this.currentSkeleton, this.currentCollection, tagFilterList).subscribe(
      (fileList :any) => {this.fileList = fileList; }
      );
  }
  
  filesFound(){
    return this.fileList && this.fileList.length > 0;
  }

  selectFile(fileID: any){
    this.selectFileEvent.emit(fileID);

  }
}
