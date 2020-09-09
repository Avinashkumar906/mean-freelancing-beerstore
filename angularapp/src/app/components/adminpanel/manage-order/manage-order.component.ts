import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from 'src/app/service/product.service';
import { Order } from 'src/app/service/order.service';
import { HttpService } from 'src/app/service/http.service';
import { DisposeBag } from '@ronas-it/dispose-bag'
import * as _ from 'lodash'
import { Router } from '@angular/router';
import { UserService, User } from 'src/app/service/user.service';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit, OnDestroy {

  
  key:string='';
  dispBag = new DisposeBag();
  orderList:Array<Order> = [];
  user:User;

  constructor(
    private httpService:HttpService,
    private userService:UserService,
    private router:Router
  ) { 
    this.user = this.userService.getUser();
  }
  
  ngOnDestroy(): void {
    this.dispBag.unsubscribe()
  }

  ngOnInit(): void {
    this.fetchOrders()
  }

  delete(order:Order){
    let result = confirm('Want to delete ?')
    if(result){
      this.dispBag.add(
        this.httpService.deleteOrder(order).subscribe(
          (order:Order)=>{
            this.fetchOrders()
            alert(`Order with id: ${order._id} is Deleted!`)
          }
        )
      )
    }
  }

  fetchOrders(){
    if(this.user && this.user.role === 'admin'){
      this.dispBag.add(
        this.httpService.getOrders().subscribe(
          (orders:Array<Order>)=>this.orderList = _.cloneDeep(orders),
          err=>console.log(err)
        )
      )
    }
  }

  totalPrice(order:Order){
    let sum = 0;
    order.items.forEach((product:Product)=>{
      sum = sum+(product.cost * product.selectedQuantity)
    })
    return sum;
  }

  viewOrder(item:any){ 
    this.router.navigate(['/orderdetail',item._id]);
  }

}

