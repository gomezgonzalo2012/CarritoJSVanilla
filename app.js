// --------------------------------VARIABLES------------------------------------
const cards = document.getElementById('cards')// para cuadrícula de productos
const items = document.getElementById('items')// para carrito
const footer = document.getElementById('footer')// para carrito
const templateCard = document.getElementById('template-card').content // accedemos a los elementos del template
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()// podemos ocupar unos solo para todo
let carrito = {} // será un objeto indexado

// --------------------------------EVENTOS------------------------------------
//-luego de cargarse todos los elementos html del documento actua la funcion callback que ejecuta el fetchData()
document.addEventListener('DOMContentLoaded', ()=>{
    fetchData()
    if(localStorage.getItem('carrito')){
        // carga desde el localStorage y lo vuelve a pasar a una colección
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
}) 
// event delegation
cards.addEventListener('click', (e)=>{
    addCarrito(e)
})
items.addEventListener('click', (e)=>{
    btnAccion(e)
})

// --------------------------------FUNCIONES------------------------------------
const fetchData = async() =>{
    try {
        const response = await fetch('api.json')
        const data = await response.json()
        pintarCards(data)
    }catch (error) {
        console.log(error);
    }
}

const pintarCards = (data)=>{
    //usamos forEach ya que api.json contiene los datos en un array
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.title
        templateCard.querySelector('p').textContent = producto.precio
        templateCard.querySelector('img').setAttribute('src',producto.thumbnailUrl)// al atributo src de <img> le agrega la url de la img
        templateCard.querySelector('.btn-dark').dataset.id = producto.id// agrega data-id con el repectivo id de cada producto
    // clonacion de cada producto
    const clone = templateCard.cloneNode(true)
    // agrgando productos al fragment
    fragment.appendChild(clone)
    });
    // agregamos todos los productos al cards
    cards.appendChild(fragment)
}

// al hacer click en el botón envía a la función setCarrito el elemento padre, osea, toda la card
const addCarrito = (e)=>{
    
    if(e.target.classList.contains('btn-dark')){
        //console.log(e.target.parentElement)
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}
// creamos un objeto producto que será enviado a el carrito
const setCarrito = (objeto)=>{
     const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio : objeto.querySelector('p').textContent,
        cantidad : 1
}
if(carrito.hasOwnProperty(producto.id)){
    producto.cantidad++
}
carrito[producto.id] = {...producto}

pintarCarrito()
}

const pintarCarrito = () =>{
    console.log(carrito)
    items.innerHTML= '' // limpiamos el html para que no se sobreescriba la informacion
    //  Object.values() devuelve un array con los valores del objeto así podemos usar el forEach()
    Object.values(carrito).forEach((producto)=>{
        templateCarrito.querySelector('th').textContent=producto.id
        templateCarrito.querySelectorAll('td')[0].textContent=producto.title
        templateCarrito.querySelectorAll('td')[1].textContent=producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id 
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id 
        templateCarrito.querySelector('span').textContent=producto.cantidad * producto.precio
        
        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    pintarFooter()

    // guarda en local storage
    // con stringfy la coleccion pasa a texto plano asci
    localStorage.setItem('carrito', JSON.stringify(carrito))
}
const pintarFooter = ()=>{
    footer.innerHTML = ''
    //  Object.key() devuelve un array con los id de atributos del objeto así podemos usar el forEach()

    if(Object.keys(carrito).length === 0){
        
        // si el carrito esta vacio hace esto:
        footer.innerHTML= `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        </tr>`
        return
    }
    // recorre al array obtenido por Object.values creo un accumulador que parte en 0 y le sumo la cantidad del elemento 
    const nCantidad = Object.values(carrito).reduce((accumulator,{cantidad})=>accumulator+ cantidad,0)
    
    const nPrecio = Object.values(carrito).reduce((accumulator,{cantidad,precio})=> accumulator+ cantidad*precio,0)
    // console.log(nCantidad)
    // console.log(nPrecio)

    templateFooter.querySelector(".cantidades").textContent= nCantidad;
    templateFooter.querySelector("span").textContent= nPrecio;

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    // vaciamos el carrito

    const btnVaciar = document.getElementById('vaciar-carrito')

    btnVaciar.addEventListener('click',()=>{
        // pone al carrito en vacío
        carrito= {}
        // llamamos para que pinte el carrito
        pintarCarrito()
    })

}

const btnAccion = (e)=>{
    if(e.target.classList.contains('btn-info') ){
         console.log('prod',carrito[e.target.dataset.id])
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito()


    }

    if(e.target.classList.contains('btn-danger') ){
        console.log('prod',carrito[e.target.dataset.id])
       const producto = carrito[e.target.dataset.id]
       producto.cantidad--
       // si la cantidad del prodcto es 0 eliminamos el objeto prducto del carrito
       if (producto.cantidad === 0){
        delete carrito[e.target.dataset.id]
       }
       
       pintarCarrito()
   }

   e.stopPropagation()
}


