import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpService } from 'src/app/service/http.service';
import { ProductService, Product } from 'src/app/service/product.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DisposeBag } from '@ronas-it/dispose-bag';
import { OrderService } from 'src/app/service/order.service';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss']
})
export class ManageProductComponent implements OnInit, OnDestroy {

  id:string;
  message = '  '
  file:File = null;
  env = environment;
  productForm:FormGroup;
  dispBag = new DisposeBag();

  constructor(
    private fBuilder:FormBuilder,
    private http:HttpService,
    private productService:ProductService,
    private orderService : OrderService,
    private route: ActivatedRoute,
  ) { 
    this.initForm();
  }

  initForm(){
    this.productForm = this.fBuilder.group({
      name:['',[Validators.required,Validators.minLength(4)]],
      cost:['',[Validators.required]],
      quantity:['',[Validators.required]],
      type:['',[Validators.required]],
      description:['',[Validators.required]],
      image:[''],
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (param)=>this.patchForm(param.get('id')),
    )
  }

  patchForm(id:string){
    this.initForm()
    
    if(id){
      this.id = id;
      this.productForm.patchValue(this.productService.getProduct(id));
    } else {
      this.id = null;
      this.file = null;
    }
  }

  ngOnDestroy(): void {
		this.dispBag.unsubscribe()
	}

  newProduct(){
    this.message = null;
    if(this.file){
      let formdata = new FormData()
      formdata.append('file',this.file,this.file.name)
      formdata.append('body',JSON.stringify(this.productForm.value))
      this.dispBag.add(
        this.http.postProduct(formdata).subscribe(
          (product:Product)=>{
            this.message="Product added";
            // this.reset()
            this.orderService.clearCart()
            this.productService.putProduct(product)
          },
          err=>this.message = err.error.message
        )
      )
    } else {
      this.message = "Please select a Imgae !"
    }
  }

  updateProduct(){
    this.message = null
    this.dispBag.add(
      this.http.updateProduct(this.productForm.value,this.id).subscribe(
        (product:Product)=>{
          this.message="Product updated !"
          this.orderService.clearCart()
          this.productService.patchedProduct(product)
        },
        err=>this.message = err.error.message
      )
    )
  }

  submit(){
    if(!this.id){
      this.newProduct()
    } else {
      this.updateProduct()
    }
  }

  reset(){
    this.initForm();
    this.file = undefined;
    this.id = undefined;
    this.message = '  ';
  }

  handleFile(event){
    this.file = <File>event.target.files[0]
  }

  get productFormControl() {
    return this.productForm.controls;
  }

  get colorArrayControl(){
    return (this.productForm.get('colors') as FormArray).controls;
  }

  addColor(element){
    let control = (this.productForm.get('colors') as FormArray);
    control.push(new FormControl(element.value))
    element.value = '';
  }

  removeColor(index:number){
    let control = this.productForm.get('colors') as FormArray;
    if(control.length>1){
      control.removeAt(index)
    } else {
      alert('Atleast one color is required')
    }
  }

}
