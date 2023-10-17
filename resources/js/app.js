import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
import moment from "moment";

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then((res) => {
        cartCounter.innerHTML = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false
        }).show();
    }).catch((err) => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false
        }).show();
    }) 
};
addToCart.forEach((btn) => {
    btn.addEventListener('click', (ele) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        console.log(pizza);
        updateCart(pizza);
    })
});
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 3000);
}

// Update order status
let statuses = document.querySelectorAll('.status-line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')
function updateStatus(order) {
    statuses.forEach((stats) => {
        stats.classList.remove('step-completed')
        stats.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataStatus = status.dataset.status
        if (stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataStatus === order.status) {
            stepCompleted = false;
            time.innerHTML = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order);

// Creates a new Socket.IO client
let socket = io()
// Join
if (order) {
    // emits the join event with the order ID. The join event is used to join a specific room on the Socket.IO server
    socket.emit('join', `order_${order._id}`)
}
const adminPath = window.location.pathname;
if (adminPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}
socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar: false
    }).show();
})