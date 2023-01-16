// Variables 
const cartBtn  = document.querySelector(".cart-btn")
const closeCartBtn  = document.querySelector(".close-cart")
const clearCartBtn  = document.querySelector(".clear-cart") 
const cartDOM  = document.querySelector(".cart")
const cartOverlay  = document.querySelector(".cart-overlay")
const cartItems  = document.querySelector(".cart-items")
const cartTotal  = document.querySelector(".cart-total")
const cartContent  = document.querySelector(".cart-content")
const productsDOM  = document.querySelector(".products-center")
// if we declare add to cart button variables here then we will get empty nodelist because the products are declared asyncronously and we have to wait for them and declare it with them
// const btns = document.querySelectorAll('.bag-btn')
// console.log(btns)

// CART
let cart = []

// Now the scenario is that we have to make 3 classes 
// 1 class is products class which is responsible for getting all the products from the json file or contentful(CMS) and store them in products variable
// 2 class is UI class which is reesponsible for the display of the products from 1st class
// 3 class is local storage which is responsible for pushing relevant items to the local storage
// lastly we have to add an event listener once the page dom is loaded and create instances and add then on the behalf of async await to perform actions


// getting the products
class Products{
    async getProducts(){
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            // now extracting only title price id and image from result.json            return products
            let products = data.items
            products = products.map(item=>{
                let title = item.fields.title
                let price = item.fields.price
                let id = item.sys.id
                let image = item.fields.image.fields.file.url
                return {title,price,id,image}
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }
    
}

// display products
class UI{
    // here the products is just a parameter and same in last action the getProducts() method provides actual products
    displayProducts(products){
        let result = ''
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src="${product.image}" alt="product" class="product-img">
                <button class="bag-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$ ${product.price}</h4>
            </article>
            `
            productsDOM.innerHTML = result
        });
    }
    getBagBtns(){
        // to get rid of NodeList we have to declare a spread operator to convert it into an array 
        const btns = [...document.querySelectorAll('.bag-btn')]
        // now we have all buttons but we need just id
        btns.forEach(button=>{
            let id = button.dataset.id

            // Check if the item is in the cart by comparing the item id and button id
            let inCart = cart.find(item => item.id === id)

            // now change the button functionality if it is in cart 
            if(inCart){
                button.innerText = "In Cart"
                button.disabled = true
            } else{
                // parameters are used to open up an object
                button.addEventListener("click",(event)=>{
                    event.target.innerText = "In Cart"
                    event.target.disabled = true
                    // getting the desired product from the local storage
                    // we have to add a spread operator to add product amount in it
                    let cartItem = {...Storage.getProduct(id),amount:1}
                    
                    // Now add the cartitem to the cart
                    cart = [...cart,cartItem]
                    // setting cart to the local storage
                    Storage.saveCart(cart)

                    // Update the cartitems value and cart total
                    this.setCartValues(cart)
                })
            }
        })
    }
    setCartValues(cart){
        let total = 0 // initial  value of cart total
        let items = 0 // initial value of cart items
        // map   through cart items to uppdate above  values
        cart.map(item => {
            total += item.price * item.amount
            items += item.amount
        })
        // now displaying the totals
        cartTotal.innerText = parseFloat(total.toFixed(2)) // parse will limit the decimal places to 2 digits
        cartItems.innerText = items

        
    }
}

// local storage
class Storage{
    // by using static we dont have to store classes into variables
    static saveProduct(product){
        localStorage.setItem("products",JSON.stringify(product))
    }
    // setting get product methood which reutrns the product when button id and product id are same
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"))
        return products.find(product => product.id === id)
    }

    // setting cart array to the local storage so that when a product button is clicked it is added to the cart and saved in local storage
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart))
    }
}

// final action combination of all classes
document.addEventListener("DOMContentLoaded",()=>{
    // storing classes in variables
    const ui = new UI()
    const products = new Products()
    
    // get all products
    products.getProducts().then((parameter) =>
        {ui.displayProducts(parameter);
        Storage.saveProduct(parameter)}).then(()=>{
            ui.getBagBtns()
        })
})