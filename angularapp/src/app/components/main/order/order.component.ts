import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, UserService } from 'src/app/service/user.service';
import { Order } from 'src/app/service/order.service';
import { HttpService } from 'src/app/service/http.service';
import { Product } from 'src/app/service/product.service';
import { DisposeBag } from '@ronas-it/dispose-bag';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {

  constructor(
    private userService:UserService,
    private httpService:HttpService,
  ) { }

  searching:boolean;
  noOrder:boolean = false
  orderList:Array<Order> = [];
  dispBag = new DisposeBag();
  user:User = this.userService.getUser()

  ngOnInit(): void {
    this.dispBag.add(
      this.userService.userChanged.subscribe(
        (user:User)=>this.user = user,
      )
    )
  }

  ngOnDestroy(): void {
		this.dispBag.unsubscribe()
	}

  fetchOrders(){
    this.searching = true;
    this.dispBag.add(
      this.httpService.getOrdersByMail(this.user).subscribe(
        (orders:Array<Order>)=>{
          this.searching = false;
          this.orderList = orders;
          this.noOrder = orders.length === 0 ? true : false;
        },
        err=>{
          this.searching = false;
          console.log(err)
        }
      )
    )
  }

  totalPrice(order:Order){
    let sum = 0;
    order.items.forEach((item:Product)=>{
      sum = sum + (item.selectedQuantity * item.cost)
    })
    return sum;
  }

}
