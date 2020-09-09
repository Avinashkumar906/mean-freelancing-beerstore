import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product, ProductService } from 'src/app/service/product.service';
import { HttpService } from 'src/app/service/http.service';
import { DisposeBag } from '@ronas-it/dispose-bag';
import { OrderService } from 'src/app/service/order.service';
import * as _ from 'lodash'
import { User, UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-updateproduct',
  templateUrl: './updateproduct.component.html',
  styleUrls: ['./updateproduct.component.scss']
})
export class UpdateproductComponent implements OnInit, OnDestroy {

  dispBag = new DisposeBag();
  key:string = '';
  productList:Array<Product> = this.createProductList(this.productService.getProducts());
  ostList:Array<Product> = this.createOstList(this.productService.getProducts());
  
  constructor(
    private productService:ProductService,
    private httpService:HttpService,
    private orderService:OrderService,
    private userService:UserService,
  ) { 
  }

  ngOnInit(): void {
    this.dispBag.add(
      this.productService.productsChanged.subscribe(
        (products:Array<Product>)=>{
          this.productList = _.cloneDeep(this.createProductList(products))
          this.ostList = _.cloneDeep(this.createOstList(products))
        }
      )
    )
  }

  ngOnDestroy(): void {
		this.dispBag.unsubscribe()
	}

  delete(product:Product){
    var result = confirm("Want to delete?");
    if(result){
      this.dispBag.add(
        this.httpService.deleteProduct(product).subscribe(
          (data:Product)=>{
            this.orderService.clearCart()
            alert('Product deleted!')
            this.productService.removeProduct(data)
          }
        )
      )
    }
  }

  createOstList(list:Array<Product>){
    return  _.filter(list,(item)=>item['quantity'] <= 0)
  }

  createProductList(list:Array<Product>){
    return  _.filter(list,(item)=>item['quantity'] > 0)
  }
}
