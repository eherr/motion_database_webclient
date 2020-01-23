/**
 * Collection data with nested structure.
 * Each node has a name and an optiona list of children.
 */
export class CollectionNode {
  id: string;
  name: string;
  children?: any[];

  constructor(c_id: string, c_name: string){
    this.id = c_id;
    this.name = c_name;
  }

  hasChild(): boolean{
    return !!this.children && this.children.length > 0;
  }
}
