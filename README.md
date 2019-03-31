# shopifydevchallenge

Technologies Used :- Node JS for Backend , MongoDB for Database


**Run this application locally :-**

git clone repo https://github.com/parulraheja98/shopifydevchallenge.git

open your terminal run commands :-

docker-compose build

docker-compose up 

The project should be live on localhost:3017

**Brief Explanation of Application:-**

When you navigate to the default route “/” 2 test products are created for you automatically ,

if you wish you can create your own custom products using “/createcustomproducts” route .



| Http Method | Route                 | Description                                                          |
|-------------|-----------------------|----------------------------------------------------------------------|
| GET         | /fetchproducts/:check | Get the products with available inventory if check=”available”       |
| GET         | /fetchproducts        | Get all the products in the store                                    |
| GET         | /cart                 | Get all the items in the cart as well as the total price of the cart |
| GET         | /cart/add/:id         | Add the product with the given id to the cart                        |
| GET         | /checkout             | Get all the items in the cart proceeded towards checkout             |
| POST        | /updatecart           | Updates the cart on change of quantity                               |
| POST        | /createProduct        | Create a custom product by getting input from the user               |



Product collection page

Products with only available inventory can be added to the cart otherwise a message will be displayed that it is out of inventory on the fetch products page accessed through “/fetchproduct”

If user tries to update the quantity higher than the inventory user we not be able to checkout , checkout button will be disabled , as well if user tries to get to “/checkout” the user will be asked to go the cart page.

Cart will display the products information and the total price of all the products . Product information include title , price and quantity. 

User will be able to update the quantity of the cart on the cart page . 

Inventory of the products get reduced on checkout by the  amount added on the cart.

Cart session is cleared after every checkout .

**Test Cases :-**

Test cases are made in test\apptest.js

**Security :-**

App is made secure by using rate limit on the api calls .

