// @ts-expect-error no types
import Toastify from 'toastify-js'

function success(msg: string) {
  Toastify({
    text: msg || 'success',
    duration: 3000,
    close: true,
    gravity: 'top', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: '#22c55e',
    },
    onClick() {}, // Callback after click
  }).showToast()
}

function error(msg: string) {
  Toastify({
    text: msg || 'something went wrong',
    duration: 3000,
    close: true,
    gravity: 'top', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: '#e74c3c',
    },
    onClick() {}, // Callback after click
  }).showToast()
}

export const Toast = {
  success,
  error,
}
